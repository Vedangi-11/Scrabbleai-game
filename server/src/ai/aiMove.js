import * as tf from "@tensorflow/tfjs";
import { WORD_LIST } from "../data/dictionarySet.js";
import { validateMove } from "../rules/moveValidator.js"; 

let model = null;
async function loadModel() {
  if (model) return model;
  try {
    model = await tf.loadLayersModel("http://localhost:3000/model/model.json");
    console.log("TFJS model loaded");
    return model;
  } catch (err) {
    console.warn("TFJS model not loaded:", err.message);
    model = null;
    return null;
  }
}

function canFormWordWithBoard(word, rack, board, row, col, horizontal) {
  const temp = [...rack];
  for (let i = 0; i < word.length; i++) {
    const r = row + (horizontal ? 0 : i);
    const c = col + (horizontal ? i : 0);
    if (r < 0 || c < 0 || r >= 15 || c >= 15) return false;
    const boardLetter = board[r][c];
    if (boardLetter) {
      if (boardLetter !== word[i]) return false;
    } else {
      const idx = temp.indexOf(word[i]);
      if (idx === -1) return false;
      temp.splice(idx, 1);
    }
  }
  return true;
}

function findAnchors(board) {
  const anchors = [];
  for (let r = 0; r < 15; r++) {
    for (let c = 0; c < 15; c++) {
      if (board[r][c]) continue;
      const adj = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1]
      ];
      const touches = adj.some(([rr, cc]) => rr >= 0 && rr < 15 && cc >= 0 && cc < 15 && board[rr][cc]);
      if (touches) anchors.push({ row: r, col: c });
    }
  }
  return anchors;
}

function boardToInput(boardWithPlacement) {
  const flat = [];
  for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) {
    const ch = boardWithPlacement[r][c];
    flat.push(ch ? ch.charCodeAt(0) - 64 : 0);
  }
  return tf.tensor(flat).reshape([1, 15, 15]).div(tf.scalar(26));
}

export async function getAIMove(game) {
  await loadModel();
  const board = game.board;
  const rack = game.aiRack || [];
  const anchors = findAnchors(board);
  const legalMoves = [];
  const isFirstMove = game.playerScore === 0 && game.aiScore === 0 && board.flat().every(c => !c);
  if (isFirstMove) {
    for (const word of WORD_LIST) {
      if (word.length > rack.length) continue;
      const row = 7;
      const col = 7 - Math.floor(word.length / 2);
      if (col < 0 || (col + word.length) > 15) continue;
      if (!canFormWordWithBoard(word, rack, board, row, col, true)) continue;
      const placements = [];
      for (let i = 0; i < word.length; i++) {
        if (!board[row][col + i]) placements.push({ row, col: col + i, letter: word[i] });
      }
      const validation = validateMove(board, placements, true);
      if (validation.valid) legalMoves.push({ row, col, word, placements: validation.placements, score: validation.score });
    }
  }

  for (const anchor of anchors) {
    for (const word of WORD_LIST) {
      if (word.length > 8) continue; 
      for (const horizontal of [true, false]) {
        for (let offset = 0; offset < word.length; offset++) {
          const row = horizontal ? anchor.row : anchor.row - offset;
          const col = horizontal ? anchor.col - offset : anchor.col;
          if (row < 0 || col < 0 || row + (horizontal ? 0 : word.length - 1) >= 15 || col + (horizontal ? word.length - 1 : 0) >= 15) continue;
          if (!canFormWordWithBoard(word, rack, board, row, col, horizontal)) continue;
          const placements = [];
          for (let i = 0; i < word.length; i++) {
            const r = row + (horizontal ? 0 : i);
            const c = col + (horizontal ? i : 0);
            if (!board[r][c]) placements.push({ row: r, col: c, letter: word[i] });
          }
          if (placements.length === 0) continue;
          const validation = validateMove(board, placements, false);
          if (validation.valid) {
            legalMoves.push({ row, col, word, placements: validation.placements, score: validation.score });
          }
        }
      }
    }
  }
  if (!legalMoves.length) return { type: "pass" };
  if (!model) {
    const pick = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    return pick;
  }
  let best = null;
  for (const move of legalMoves) {
    const copy = board.map(r => [...r]);
    for (const p of move.placements) copy[p.row][p.col] = p.letter;
    const input = boardToInput(copy);
    try {
      const pred = model.predict(input);
      const val = (await pred.data())[0];
      if (!best || val > best.score) best = { ...move, score: val };
      tf.dispose([pred, input]);
    } catch (err) {
      tf.dispose(input);
    }
  }
  return best || { type: "pass" };
}
