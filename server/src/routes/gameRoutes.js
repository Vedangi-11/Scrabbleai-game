import express from "express";
import { aimove, createGame, deletegame, draw, exchangetile, getgame, pass, playermove, validate } from "../controllers/gameController.js";
const router = express.Router();

router.post("/create",createGame);
router.post("/validate",validate);
router.post("/player-move",playermove);
router.post("/ai-move/:id",aimove);
router.post("/draw/:id",draw);
router.get("/:id",getgame);
router.delete("/:gameId",deletegame);
router.post("/pass/:id", pass);
router.post("/exchange", exchangetile);
export default router;
