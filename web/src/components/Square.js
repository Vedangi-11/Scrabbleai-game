"use client";
import { useDrop, useDrag } from "react-dnd";
import { useDispatch, useSelector } from "react-redux";
import { addPlacement, removePlacement } from "../../redux/gameSlice";
import { motion } from "framer-motion";
import { MULTIPLIERS } from "../../data/clientMultipliers";
import { useRef } from "react";

export default function Square({ row, col, letter }) {
  const dispatch = useDispatch();
  const pending = useSelector(s => s.game.pendingPlacements);
  const validation = useSelector(s => s.game.validation);
  const placed = pending.find(p => p.row === row && p.col === col);

  const [{ isOver }, drop] = useDrop({
    accept: "TILE",
    drop: (item) => {
      if (item.fromBoard) {
        dispatch(removePlacement({
          row: item.row,
          col: item.col,
          toRack: false 
        }));
      }
      const payload = {
        row,
        col,
        letter: item.isBlank ? "_" : item.letter,
        isBlank: !!item.isBlank,
        blankFor: item.isBlank ? item.blankFor : null,
        fromRack: item.fromRack || false   
      };
      if (payload.isBlank && !payload.blankFor) {
        const ch = prompt("Blank letter (A-Z):", "E");
        if (!ch) return;
        payload.blankFor = ch.toUpperCase();
      }
      dispatch(addPlacement(payload));
    },
    collect: m => ({ isOver: !!m.isOver() })
  });

  const [{ isDragging }, drag] = useDrag({
    type: "TILE",
    item: placed
      ? {
        letter: placed.letter,
        isBlank: placed.isBlank,
        blankFor: placed.blankFor,
        row,
        col,
        fromBoard: true
      }
      : null,
    canDrag: !!placed,
    collect: monitor => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const ref = useRef(null);
  drag(drop(ref));

  const invalid = validation && !validation.valid && placed;
  const mult = MULTIPLIERS[row][col];

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.03 }}
      className={ "w-8 h-8 flex items-center justify-center relative border text-xs font-medium " +
        (letter ? "bg-slate-200" : "bg-white") + (invalid ? " border-2 border-red-600 bg-red-200" : "") +
        (isDragging ? " opacity-40" : "")}>
      {!letter && !placed && mult && (
        <div className="absolute top-0 left-0 text-[9px] px-0.5 py-0.5 opacity-80">
          {mult}
        </div>
      )}
      <div className={"z-10 " + (invalid ? "text-red-600" : "")}>
        {placed ? (placed.isBlank ? placed.blankFor : placed.letter) : letter}
      </div>
      {isOver && !letter && (
        <div className="absolute inset-0 bg-green-200 opacity-20 pointer-events-none" />
      )}
      {placed && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 pointer-events-none" />
      )}
    </motion.div>
  );
}
