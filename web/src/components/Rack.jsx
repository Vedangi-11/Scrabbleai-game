"use client";
import { useSelector, useDispatch } from "react-redux";
import { useDrop, useDrag } from "react-dnd";
import { removePlacement } from "../../redux/gameSlice";

export default function Rack({ selected = [], onToggleSelect }) {
 const game = useSelector(s => s.game.current);
  const dispatch = useDispatch();
  if (!game) return null;

  const playerRack=Array.isArray(game?.playerRack)
  ?game.playerRack
  :[];
  const [, drop] = useDrop({
    accept: "TILE",
    drop: (item) => {
      if (item.fromBoard) {
        dispatch(
          removePlacement({
            row: item.row,
            col: item.col,
            toRack: true,
          })
        );
      }
    },
  });

  return (
    <div className="mt-4">
      <h4 className="mb-2 font-semibold">Your Rack</h4>
      <div ref={drop} className="flex gap-1 bg-slate-200 p-2 rounded min-h-[48px]">
        {playerRack.map((tile, idx) => (
          <Tile key={`${tile.letter ?? tile}-${idx}`} tile={tile} index={idx} selected={selected.includes(idx)} onToggleSelect={() => onToggleSelect(idx)}/>
        ))}
      </div>
    </div>
  );
}

function Tile({ tile, index, selected, onToggleSelect }) {
  const letter = tile.letter ?? tile;
  const isBlank = letter === "_";
  const [{ isDragging }, drag] = useDrag({
    type: "TILE",
    item: {
      letter,
      index,
      isBlank,
      fromRack: true,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      onClick={(e) => {
        e.stopPropagation();    
        onToggleSelect();
      }}
      className={` w-8 h-10 flex items-center justify-center border rounded cursor-pointer select-none
        font-bold text-black transition-all duration-150 ${selected ? "bg-blue-300 border-blue-700 shadow-md scale-105" : "bg-amber-100 border-amber-600"} ${isDragging ? "opacity-50" : ""}`}>
      {isBlank ? "_" : letter}
    </div>
  );
}
