import { isValidWord } from "../utils/dictionary.js";
import { LETTER_POINTS } from "../data/letterPoints.js";
import { MULTIPLIERS } from "../data/multipliers.js";

function isSingleLine(placements) {
  const rows = new Set(placements.map(p => p.row));
  const cols = new Set(placements.map(p => p.col));
  return rows.size === 1 || cols.size === 1;
}

function coversCenter(placements) {
  return placements.some(p => p.row === 7 && p.col === 7);
}

function inBounds(r, c) {
  return r >= 0 && r < 15 && c >= 0 && c < 15;
}

function getCell(board, placementsMap, r, c) {
  const key = `${r},${c}`;
  if (placementsMap.has(key)) {
    const p = placementsMap.get(key);
    return p.isBlank ? p.blankFor.toUpperCase() : p.letter.toUpperCase();
  }
  return (board[r][c] || "").toUpperCase();
}

function buildWord(board, placementsMap, startR, startC, dr, dc) {
  let r = startR, c = startC;
  while (inBounds(r - dr, c - dc) && getCell(board, placementsMap, r - dr, c - dc)) {
    r -= dr; c -= dc;
  }
  let letters = [];
  let coords = [];
  while (inBounds(r, c) && getCell(board, placementsMap, r, c)) {
    letters.push(getCell(board, placementsMap, r, c));
    coords.push([r, c]);
    r += dr; c += dc;
  }
  return { word: letters.join(""), coords };
}

function crossWords(board, placementsMap, placements) {
  const words = [];
  const horizontal = (new Set(placements.map(p => p.row))).size === 1;
  for (const p of placements) {
    const r = p.row, c = p.col;
    const dr = horizontal ? 1 : 0;
    const dc = horizontal ? 0 : 1;
    const built = buildWord(board, placementsMap, r, c, dr, dc);
    if (built.word.length > 1) words.push(built);
  }
  return words;
}

function computeScore(board, placementsMap, placements) {
  const horizontal = (new Set(placements.map(p => p.row))).size === 1;
  const p0 = placements[0];
  const dr = horizontal ? 0 : 1;
  const dc = horizontal ? 1 : 0;
  const startR = p0.row, startC = p0.col;
  const primary = buildWord(board, placementsMap, startR, startC, dr, dc);
  let wordMultiplier = 1;
  let wordScore = 0;
  for (const [r, c] of primary.coords) {
    const key = `${r},${c}`;
    const isPlaced = placementsMap.has(key);
    const ch = getCell(board, placementsMap, r, c);
    const base = LETTER_POINTS[ch] || 0;
    let letterMul = 1;
    if (isPlaced) {
      const mult = MULTIPLIERS[r][c];
      if (mult === "DL") letterMul = 2;
      if (mult === "TL") letterMul = 3;
      if (mult === "DW") wordMultiplier *= 2;
      if (mult === "TW") wordMultiplier *= 3;
    }
    wordScore += base * letterMul;
  }
  const primaryScore = wordScore * wordMultiplier;
  const crosses = crossWords(board, placementsMap, placements);
  let crossTotal = 0;
  for (const w of crosses) {
    let wMul = 1;
    let wScore = 0;
    for (const [r, c] of w.coords) {
      const ch = getCell(board, placementsMap, r, c);
      const base = LETTER_POINTS[ch] || 0;
      const isPlaced = placementsMap.has(`${r},${c}`);
      let lMul = 1;
      if (isPlaced) {
        const mult = MULTIPLIERS[r][c];
        if (mult === "DL") lMul = 2;
        if (mult === "TL") lMul = 3;
        if (mult === "DW") wMul *= 2;
        if (mult === "TW") wMul *= 3;
      }
      wScore += base * lMul;
    }
    crossTotal += wScore * wMul;
  }
  return { primaryWord: primary.word, primaryScore, crossWords: crosses.map(x => x.word), crossScore: crossTotal, totalScore: primaryScore + crossTotal };
}

export function validateMove(board, placements, isFirstMove = false) {
  if (!placements || placements.length === 0) {
    return { valid: false, reason: "No tiles placed." };
  }
  if (!isSingleLine(placements)) {
    return { valid: false, reason: "Tiles must be placed in a single straight line." };
  }
  for (const p of placements) {
    if (board[p.row][p.col]) {
      return { valid: false, reason: "Cannot place on top of existing tile." };
    }
  }
  function touchesExistingTile(r, c) {
    const adj = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1]
    ];
    return adj.some(
      ([rr, cc]) =>
        rr >= 0 && rr < 15 &&
        cc >= 0 && cc < 15 &&
        board[rr][cc]
    );
  }
  const touches = placements.some(p => touchesExistingTile(p.row, p.col));
  if (!isFirstMove && !touches) {
    return { valid: false, reason: "Placed tiles must touch existing tiles." };
  }
  if (isFirstMove && !coversCenter(placements)) {
    return { valid: false, reason: "First move must cover the center square (7,7)." };
  }
  const placementsMap = new Map();
  for (const p of placements) {
    placementsMap.set(`${p.row},${p.col}`, p);
  }
  const horizontal = new Set(placements.map(p => p.row)).size === 1;
  const dr = horizontal ? 0 : 1;
  const dc = horizontal ? 1 : 0;
  const ref = placements[0];
  const primaryBuilt = buildWord(board, placementsMap, ref.row, ref.col, dr, dc);
  if (!primaryBuilt || !primaryBuilt.word) {
    return { valid: false, reason: "Could not form a valid main word." };
  }
  const primaryWord = primaryBuilt.word.trim().toUpperCase();
  if (!isValidWord(primaryWord)) {
    return {
      valid: false,
      reason: `Primary word "${primaryWord}" is not in dictionary.`,
      word: primaryWord
    };
  }
  const crosses = crossWords(board, placementsMap, placements);
  for (const cw of crosses) {
    const crossWord = cw.word.trim().toUpperCase();
    if (!isValidWord(crossWord)) {
      return {
        valid: false,
        reason: `Cross word "${crossWord}" is not in dictionary.`,
        word: crossWord
      };
    }
  }
  const scoring = computeScore(board, placementsMap, placements);
  return {
    valid: true,
    word: scoring.primaryWord,
    score: scoring.totalScore,
    breakdown: {
      primary: scoring.primaryWord,
      primaryScore: scoring.primaryScore,
      crossWords: scoring.crossWords,
      crossScore: scoring.crossScore
    },
    placements
  };
}
