"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setGame, updateGame, endGame } from "../../redux/gameSlice.js";
import Board from "../components/Board.jsx";
import AIRack from "../components/aiRack.jsx";
import Controls from "../components/Controls.jsx";
import EndGameButton from "@/components/EndGame.jsx";
import { motion } from "framer-motion";
export default function Home() {
  const dispatch = useDispatch();
  const game = useSelector((s) => s.game.current);
  const aiThinking = useSelector((s) => s.game.aiThinking);
  const [loading, setLoading] = useState(false);
  const floatingTiles = ["S", "C", "R", "A", "B", "B", "L", "E", "A", "I"];
  const [showBag, setShowBag] = useState(false);
  const [bagCounts, setBagCounts] = useState({});
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  function computeBagCounts(bagArray) {
    const counts = {};
    for (const tile of bagArray) {
      counts[tile] = (counts[tile] || 0) + 1;
    }
    return counts;
  }

  async function startGame() {
    setLoading(true);
    const res = await axios.post(`${API_BASE}/api/game/create`);

    const counts = computeBagCounts(res.data.tileBag);
    setBagCounts(counts);

    dispatch(setGame(res.data));
    setLoading(false);
  }

  async function refresh() {
    if (!game?._id) return;
    try {
      const res = await axios.get(`${API_BASE}/api/game/${game._id}`);
      const counts = computeBagCounts(res.data.tileBag);
      setBagCounts(counts);
      dispatch(updateGame(res.data));
    } catch (err) {
      dispatch(endGame());
    }
  }

  useEffect(() => {
    if (!game?._id) return;
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [game?._id]);

  return (
    <main className="h-screen bg-gradient-to-b from-amber-100 to-yellow-50 overflow-hidden">
      <header className="flex justify-between items-center mb-10 px-6">
        <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-sm pt-4">
          🧩 Scrabble — Human vs AI
        </h1>
        {game && (
          <span className="px-4 py-2 rounded-full text-sm font-semibold
            bg-white shadow-md border border-gray-200">
            {aiThinking ? "🤖 AI Turn" : "🧑 Your Turn"}
          </span>
        )}
      </header>
      {!game ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center 
         bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-200 overflow-hidden">
          {floatingTiles.map((t, i) => (
            <motion.div key={i} initial={{ y: -200, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.15,type: "spring",stiffness: 60,}}
              className="absolute text-black font-extrabold text-xl bg-[#F4D88C] border-2 border-[#8B5A2B] rounded-md shadow-lg w-14 h-14 flex items-center justify-center select-none z-40"
              style={{ left: `${2 + i * 10}%`, top: `${Math.random() * 20 + 10}%`, transform: `rotate(${Math.random() * 30 - 15}deg)`,}}>
              {t}
            </motion.div>
          ))}
          <div className="flex flex-col items-center mt-2 pt-4">
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2, type: "spring", stiffness: 80 }} className="mt-6 rounded-2xl p-10 shadow-[0_10px_25px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center">
              <p className="text-center text-[#7A5836] text-lg mb-8">
                Challenge the AI in a beautifully crafted classic word game.
              </p>
              <button onClick={startGame} className="bg-[#C89F5D] hover:bg-[#B98C4E] transition-all
                 text-white font-semibold px-8 py-4 rounded-xl shadow-lg text-xl">
                {loading ? "Starting..." : "Start New Game"}
              </button>
            </motion.div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[260px_1fr_260px] gap-8 px-6">
            <div className="p-4 bg-white shadow-lg rounded-2xl border border-gray-200 h-[260px]">
              <h3 className="text-xl font-bold mb-3 text-gray-800">
                🧑 You — {game.playerScore}
              </h3>
              <Controls />
            </div>
            <div className="flex justify-center">
              <div className="p-5 bg-white shadow-xl rounded-2xl border border-gray-200">
                <Board />
              </div>
            </div>
            <div className="p-4 bg-white shadow-lg rounded-2xl border border-gray-200 h-[220px]">
              <h3 className="text-xl font-bold mb-3 text-red-700">
                🤖 AI — {game.aiScore}
              </h3>
              <AIRack />
            </div>
          </div>
          <div className="absolute bottom-20 right-6 z-50">
            <motion.img src="/tilebag1.png" alt="Tile Bag" className="w-10 cursor-pointer drop-shadow-lg"
              whileHover={{ scale: 1.15 }} onClick={() => setShowBag(true)}/>
          </div>
          <EndGameButton />
          {showBag && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-6 rounded-2xl shadow-xl max-h-[80vh] overflow-y-auto border-2 border-amber-700">
                <h3 className="text-2xl font-bold mb-4 text-amber-800">
                  Tile Bag — Remaining Letters
                </h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left">Letter</th>
                      <th className="py-2 text-left">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(bagCounts).map(([letter, count]) => (
                      <tr key={letter} className="border-b">
                        <td className="py-2 font-semibold">
                          {letter === "_" ? "Blank" : letter}
                        </td>
                        <td className="py-2">{count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="mt-4 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-xl"
                  onClick={() => setShowBag(false)}>
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </>
      )}
    </main>
  );
}