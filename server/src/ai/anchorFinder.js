export function findAnchors(board) {
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
      const touches = adj.some(
        ([rr, cc]) =>
          rr >= 0 && rr < 15 &&
          cc >= 0 && cc < 15 &&
          board[rr][cc]
      );
      if (touches) anchors.push({ row: r, col: c });
    }
  }
  return anchors;
}
