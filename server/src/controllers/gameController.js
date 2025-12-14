import Game from "../models/Game.js";
import { shuffle, shuffleBag, drawTiles, STANDARD_BAG } from "../utils/tileBag.js";
import { validateMove } from "../rules/moveValidator.js";
import { getAIMove } from "../ai/aiMove.js";


function countTiles(bag) {
  const map = {};
  for (const t of bag) map[t] = (map[t] || 0) + 1;
  return map;
}

export const createGame=async(req,res)=>{
    const bag = shuffleBag(STANDARD_BAG);
      const { drawn: pRack, bag: afterP } = drawTiles(bag, 7);
      const { drawn: aiRack, bag: afterAi } = drawTiles(afterP, 7);
      const emptyBoard = Array(15)
        .fill()
        .map(() => Array(15).fill(""));
      const game = await Game.create({
        board: emptyBoard,
        playerRack: pRack,
        aiRack,
        playerScore: 0,
        aiScore: 0,
        turn: "player",
        tileBag: afterAi
      });
      res.json({
        ...game.toObject(),
        remainingTiles: countTiles(afterAi)
      });
}

export const validate=async(req,res)=>{
    const { gameId, placements } = req.body;
      const game = await Game.findById(gameId);
      if (!game) return res.status(404).json({ error: "game not found" });
      const isFirst =
        game.playerScore === 0 &&
        game.aiScore === 0 &&
        game.board.flat().every(c => !c);
      const result = validateMove(game.board, placements, isFirst);
      res.json(result);
}

export const playermove=async(req,res)=>{
const { gameId, placements } = req.body;
  const game = await Game.findById(gameId);
  if (!game) return res.status(404).json({ error: "Game not found" });
  const isFirst =
    game.playerScore === 0 &&
    game.aiScore === 0 &&
    game.board.flat().every(c => !c);
  const result = validateMove(game.board, placements, isFirst);
  if (!result.valid) {
    return res.status(400).json({ error: result.reason });
  }
  for (const p of placements) {
    game.board[p.row][p.col] = p.isBlank
      ? p.blankFor.toUpperCase()
      : p.letter.toUpperCase();
  }
  game.playerScore += result.score;
  for (const p of placements) {
    const tile = p.isBlank ? "_" : p.letter;
    const idx = game.playerRack.indexOf(tile);
    if (idx !== -1) game.playerRack.splice(idx, 1);
  }
  const { drawn, bag } = drawTiles(game.tileBag, 7 - game.playerRack.length);
  game.playerRack.push(...drawn);
  game.tileBag = bag;
  game.turn = "ai";
  await game.save();
  res.json({
    ...game.toObject(),
    remainingTiles: countTiles(game.tileBag)
  });
}

export const aimove=async(req,res)=>{
    const game = await Game.findById(req.params.id);
      if (!game) return res.status(404).json({ error: "game not found" });
      const aiDecision = await getAIMove(game);
      if (!aiDecision || aiDecision.type === "pass") {
        game.turn = "player";
        await game.save();
        return res.json({
          game: {
            ...game.toObject(),
            remainingTiles: countTiles(game.tileBag)
          },
          aiMove: { type: "pass" }
        });
      }
      const placements = aiDecision.placements;
      if (!placements || placements.length === 0) {
        game.turn = "player";
        await game.save();
        return res.json({
          game: {
            ...game.toObject(),
            remainingTiles: countTiles(game.tileBag)
          },
          aiMove: { type: "pass" }
        });
      }
      const isFirst =
        game.playerScore === 0 &&
        game.aiScore === 0 &&
        game.board.flat().every(c => !c);
      const result = validateMove(game.board, placements, isFirst);
      if (!result.valid) {
        game.turn = "player";
        await game.save();
        return res.json({
          game: {
            ...game.toObject(),
            remainingTiles: countTiles(game.tileBag)
          },
          aiMove: { type: "pass", reason: result.reason }
        });
      }
      for (const p of placements) {
        game.board[p.row][p.col] = p.letter.toUpperCase();
      }
      game.aiScore += result.score;
      for (const p of placements) {
        const idx = game.aiRack.indexOf(p.letter);
        if (idx !== -1) game.aiRack.splice(idx, 1);
      }
      const { drawn, bag } = drawTiles(game.tileBag, 7 - game.aiRack.length);
      game.aiRack.push(...drawn);
      game.tileBag = bag;
      game.turn = "player";
      await game.save();
      res.json({
        game: {
          ...game.toObject(),
          remainingTiles: countTiles(game.tileBag)
        },
        aiMove: {
          word: result.word,
          placements,
          score: result.score
        }
      });
}

export const draw=async(req,res)=>{
    const { count } = req.body;
      const game = await Game.findById(req.params.id);
      if (!game) return res.status(404).json({ error: "game not found" });
      const { drawn, bag } = drawTiles(game.tileBag, count || 1);
      game.tileBag = bag;
      await game.save();
      res.json({
        drawn,
        game: {
          ...game.toObject(),
          remainingTiles: countTiles(bag)
        }
      });
}

export const getgame=async(req,res)=>{
     const game = await Game.findById(req.params.id);
      if (!game) return res.status(404).json({ error: "game not found" });
      res.json({
        ...game.toObject(),
        remainingTiles: countTiles(game.tileBag)
      });
}

export const deletegame=async(req,res)=>{
    try {
        const { gameId } = req.params;
        const deleted = await Game.findByIdAndDelete(gameId);
        if (!deleted) {
          return res.status(404).json({ error: "Game not found" });
        }
        res.json({ message: "Game ended & deleted successfully" });
      } catch (err) {
        res.status(500).json({ error: "Failed to delete game" });
      }
}

export const pass=async(req,res)=>{
try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ error: "Game not found" });
    game.turn = "ai";
    await game.save();
    const aiDecision = await getAIMove(game);
    if (!aiDecision || aiDecision.type === "pass") {
      game.turn = "player";
      await game.save();
      return res.json({
        ...game.toObject(),
        aiMove: { type: "pass" },
        remainingTiles: countTiles(game.tileBag)
      });
    }
    const placements = aiDecision.placements;
    const isFirst =
      game.playerScore === 0 &&
      game.aiScore === 0 &&
      game.board.flat().every(c => !c);
    const result = validateMove(game.board, placements, isFirst);
    if (result.valid) {
      for (const p of placements) {
        game.board[p.row][p.col] = p.letter.toUpperCase();
      }
      game.aiScore += result.score;
      for (const p of placements) {
        const idx = game.aiRack.indexOf(p.letter);
        if (idx !== -1) game.aiRack.splice(idx, 1);
      }
      const { drawn, bag } = drawTiles(game.tileBag, 7 - game.aiRack.length);
      game.aiRack.push(...drawn);
      game.tileBag = bag;
    }
    game.turn = "player";
    await game.save();
    res.json({
      ...game.toObject(),
      aiMove: {
        word: result.word,
        placements,
        score: result.score
      },
      remainingTiles: countTiles(game.tileBag)
    });
  } catch (err) {
    res.status(500).json({ error: "Pass failed", details: err });
  }
}

export const exchangetile=async(req,res)=>{
    try {
        const { gameId, indices } = req.body;
        const game = await Game.findById(gameId);
        if (!game) return res.status(404).json({ error: "Game not found" });
        if (game.turn !== "player") {
          return res.status(400).json({ error: "Not player's turn" });
        }
        if (game.tileBag.length < 7) {
          return res.status(400).json({
            error: "Cannot exchange — fewer than 7 tiles in bag"
          });
        }
        if (!Array.isArray(indices) || indices.length === 0) {
          return res.status(400).json({ error: "No tiles selected" });
        }
        const removed = [];
        indices
          .sort((a, b) => b - a)
          .forEach(i => {
            if (game.playerRack[i]) {
              removed.push(game.playerRack[i]);
              game.playerRack.splice(i, 1);
            }
          });
        game.tileBag.push(...removed);
        for (let i = game.tileBag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [game.tileBag[i], game.tileBag[j]] =
            [game.tileBag[j], game.tileBag[i]];
        }
        const drawCount = removed.length;
        for (let i = 0; i < drawCount; i++) {
          if (game.tileBag.length > 0) {
            game.playerRack.push(game.tileBag.pop());
          }
        }
        game.turn = "AI";
        await game.save();
        res.json(game);
      } catch (err) {
        console.error("Exchange Error:", err);
        res.status(500).json({ error: err.message });
      }
}