import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  current: null,
  loading: false,
  pendingPlacements: [],
  validation: null,
  aiThinking: false,
  gameOver: false,
  status: null,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setGame: (state, action) => {
      state.current = action.payload;
      state.aiThinking = false;
    },
    updateGame: (state, action) => {
      const payload = action.payload;
      const game =
        payload?.game && payload.game.board
          ? payload.game
          : payload;
      state.current = game;
      state.aiThinking = false;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    addPlacement(state, action) {
      const { row, col, letter, isBlank, blankFor, fromRack } = action.payload;
      state.pendingPlacements = state.pendingPlacements.filter(
        p => !(p.row === row && p.col === col)
      );
      state.pendingPlacements.push({
        row,
        col,
        letter,
        isBlank,
        blankFor
      });
      if (fromRack && state.current?.playerRack) {
        const idx = state.current.playerRack.findIndex(
          t => t === letter || (letter === "_" && t === "_"));
        if (idx !== -1) state.current.playerRack.splice(idx, 1);
      }
    },
    clearPlacements(state) {
      state.pendingPlacements = [];
    },
    setValidation(state, action) {
      state.validation = action.payload;
    },
    removePlacement(state, action) {
      const { row, col, toRack } = action.payload;
      const tile = state.pendingPlacements.find(
        p => p.row === row && p.col === col
      );
      state.pendingPlacements = state.pendingPlacements.filter(
        p => !(p.row === row && p.col === col)
      );
      if (toRack && tile && state.current?.playerRack) {
        state.current.playerRack.push(
          tile.isBlank ? "_" : tile.letter
        );
      }
    },
    endGame(state) {
      state.current = null;
      state.pendingPlacements = [];
      state.validation = null;
      state.aiThinking = false;  
    },
    setAIThinking: (state, action) => {
      state.aiThinking = action.payload;
    }
  }
});

export const { setGame,updateGame,setLoading,addPlacement,removePlacement,clearPlacements,
  setValidation,endGame,setAIThinking} = gameSlice.actions;
export default gameSlice.reducer;
