export function extendFromAnchor(board, anchor, rack, dictionary) {
  const results = [];
  for (const letter of rack) {
    for (const dir of ["H", "V"]) {
      const placements = [];
      let word = letter;
      placements.push({
        row: anchor.row,
        col: anchor.col,
        letter
      });
      const dr = dir === "H" ? 0 : 1;
      const dc = dir === "H" ? 1 : 0;
      let r = anchor.row + dr;
      let c = anchor.col + dc;
      while (r < 15 && c < 15 && board[r][c]) {
        word += board[r][c];
        r += dr;
        c += dc;
      }
      if (dictionary.has(word)) {
        results.push({
          word,
          placements
        });
      }
    }
  }
  return results;
}
