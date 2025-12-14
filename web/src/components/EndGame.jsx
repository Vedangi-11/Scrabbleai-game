"use client";
import { useDispatch, useSelector } from "react-redux";
import { endGame } from "../../redux/gameSlice";

export default function EndGameButton({ className = "" }) {
  const dispatch = useDispatch();
  const game = useSelector(s => s.game.current);
  if (!game?._id) return null;

  const handleEndGame = async () => {
    const confirmEnd = window.confirm("Are you sure you want to end this game?");
    if (!confirmEnd) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/game/${game._id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        throw new Error("Backend delete failed");
      }
      dispatch(endGame()); 
      alert("Game ended successfully!");
    } catch (err) {
      console.error("End Game Error:", err);
      alert(" Failed to end game");
    }
  };

  return (
    <button onClick={handleEndGame} className={`fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded shadow-lg hover:bg-red-700 z-20 ${className}`}>
      End Game
    </button>
  );
}
