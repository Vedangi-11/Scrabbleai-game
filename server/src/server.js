import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import gameRoutes from "./routes/gameRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "2mb" }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI;

mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error", err));

app.use("/api/game", gameRoutes);

app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
