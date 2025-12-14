"use client";
import { useDispatch } from "react-redux";
import { endGame } from "../redux/gameSlice";
import { motion } from "framer-motion";

export default function WinModal({ status }) {
  const dispatch = useDispatch();
  const title =
    status === "player_won"
      ? "🎉 You Win!"
      : status === "ai_won"
      ? "🤖 AI Wins"
      : "🤝 It's a Draw";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <button onClick={() => dispatch(endGame())} className="px-6 py-3 bg-amber-700 text-white rounded-xl mt-4">
          Play Again
        </button>
      </motion.div>
    </div>
  );
}
