"use client";
import { useSelector } from "react-redux";
import Square from "./Square.js";

export default function Board() {
  const game = useSelector(s => s.game.current);
  if (!game || !Array.isArray(game.board)) return null;
  return (
    <div className="board grid grid-cols-15 gap-0 border p-1 ms-[40px]">
      {game.board.map((row, rIdx) =>
        row.map((cell, cIdx) => (
          <Square key={`${rIdx}-${cIdx}`} row={rIdx} col={cIdx} letter={cell}/>
        ))
      )}
    </div>
  );
}
