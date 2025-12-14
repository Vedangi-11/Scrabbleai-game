import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
  board: { type: [[String]], default: Array(15).fill().map(()=>Array(15).fill("")) },
  playerRack: [String],
  aiRack: [String],
  playerScore: { type: Number, default: 0 },
  aiScore: { type: Number, default: 0 },
  turn: { type: String, default: "player" }, 
  tileBag: [String],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Game", GameSchema);
