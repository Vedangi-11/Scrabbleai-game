"use client";
import { useSelector } from "react-redux";

export default function AIRack() {
  const game = useSelector(s => s.game.current);
  const aiThinking = useSelector(s => s.game.aiThinking);
  if (!game || !Array.isArray(game.aiRack)) return null;
  return (
    <div className="mt-4">
      <h4 className="mb-2 text-red-700 font-semibold">AI Rack</h4>
      <div className="flex gap-1">
        {game.aiRack.map((letter, idx) => (
          <div key={idx} className="w-8 h-10 flex items-center justify-center border rounded bg-gray-300 text-black font-bold">
            {letter}
          </div>
        ))}
      </div>
      {aiThinking && (
        <div className="text-red-600 font-semibold animate-pulse mt-2">
          AI Processing...
        </div>
      )}
    </div>
  );
}

