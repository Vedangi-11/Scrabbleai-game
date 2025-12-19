"use client";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { updateGame,clearPlacements,setAIThinking} from "../../redux/gameSlice.js";
import { useEffect, useState } from "react";
import Rack from "./Rack.jsx";

export default function Controls() {
  const game = useSelector(s => s.game.current);
  const pending = useSelector(s => s.game.pendingPlacements);
  const validation = useSelector(s => s.game.validation);
  const aiThinking = useSelector(s => s.game.aiThinking);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const dispatch = useDispatch();
  const [playerLoading, setPlayerLoading] = useState(false);
  const [selectedForExchange, setSelectedForExchange] = useState([]);
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const isFirst =
    game &&
    game.playerScore === 0 &&
    game.aiScore === 0 &&
    game.board.flat().every(c => !c);

  useEffect(() => {
    if (!game || pending.length === 0) return;
    axios.post(`${API_BASE}/api/game/validate`, {
      gameId: game._id,
      placements: pending,
      isFirstMove: isFirst
    }).then(res => {
      dispatch({ type: "game/setValidation", payload: res.data });
    }).catch(() => {
      dispatch({ type: "game/setValidation", payload: { valid: false } });
    });
  }, [pending, game]);

  async function submitMove() {
    if (!validation?.valid)
      return alert("Invalid word. Fix highlighted tiles.");
    setPlayerLoading(true);
    dispatch(setAIThinking(false)); 
    try {
      const commit = await axios.post(
        `${API_BASE}/api/game/player-move`,
        { gameId: game._id, placements: pending }
      );
      dispatch(updateGame(commit.data));
      dispatch(clearPlacements());
      setPlayerLoading(false);
      dispatch(setAIThinking(true));
      const ai = await axios.post(
        `${API_BASE}/api/game/ai-move/${game._id}`
      );
      dispatch(updateGame(ai.data.game)); 
    } catch (err) {
      alert("Submission failed");
      setPlayerLoading(false);
      dispatch(setAIThinking(false));
    }
  }
  
  async function passTurn() {
    const id = game._id;
    try {
      const res = await axios.post(`${API_BASE}/api/game/pass/${id}`);
      dispatch(updateGame(res.data));
    }
    catch (err) {
      alert(err);
    }
  }

  const handleConfirmExchange = async () => {
    if (!selectedForExchange.length) {
      alert("Select at least one tile");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/game/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game._id,
          indices: selectedForExchange
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      dispatch(updateGame(data));
      setSelectedForExchange([]);
      setShowExchangeModal(false);
      dispatch(setAIThinking(true));
      const ai = await axios.post(
        `${API_BASE}/api/game/ai-move/${data._id}`
      );
      dispatch(updateGame(ai.data.game));
      dispatch(setAIThinking(false));
    } catch (err) {
      alert("Exchange failed");
      dispatch(setAIThinking(false));
    }
  };

  const toggleExchangeTile = (index) => {
    setSelectedForExchange(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <>
      {showExchangeModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center">
          <div className="bg-white p-5 rounded shadow-xl w-80 text-center z-[10000]">
            <h3 className="text-lg font-bold mb-3">Exchange Tiles</h3>
            <p className="mb-3">
              Selected Tiles:{" "}
              {selectedForExchange.length
                ? selectedForExchange
                  .map(i => game.playerRack[i]?.letter ?? game.playerRack[i])
                  .join(", ")
                : "None"}
            </p>
            <button onClick={handleConfirmExchange} className="bg-blue-600 text-white px-4 py-2 rounded mr-2">
              Confirm
            </button>
            <button onClick={() => setShowExchangeModal(false)} className="bg-gray-400 text-black px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 mt-2 space-y-2">
        <Rack selected={selectedForExchange} onToggleSelect={toggleExchangeTile}/>
        <button className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50" onClick={submitMove}
          disabled={!pending.length || playerLoading || aiThinking}>
          {playerLoading ? "Submitting..." : "Submit Move"}
        </button>
        <button onClick={passTurn} className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded-md shadow ms-2" disabled={aiThinking || playerLoading}>
          Pass
        </button>
        <button onClick={() => setShowExchangeModal(true)} disabled={aiThinking || game.tileBag.length < 7}
          className="bg-blue-500 disabled:bg-gray-300 text-white px-4 py-2 rounded">
          Exchange
        </button>
      </div>
    </>
  );
}
