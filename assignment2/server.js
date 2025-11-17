// server.js
// -----------------------------------------------
// Entry point for the Node + Express backend.
// -----------------------------------------------

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import diceRoutes from './routes/diceRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';

import {
    newGame,
    serializeGame,
    endGame as endGameLogic,
} from './gameState.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse JSON bodies
app.use(express.json());

// ---------- GAME ENDPOINTS ----------

// POST /api/game/new
app.post('/api/game/new', (req, res) => {
    newGame();
    const state = serializeGame();
    res.json(state);
});

// GET /api/game/state
app.get('/api/game/state', (req, res) => {
    const state = serializeGame();
    res.json(state);
});

// POST /api/game/end
app.post('/api/game/end', (req, res) => {
    endGameLogic();
    const state = serializeGame();
    res.json(state);
});

// ---------- DICE & SCORE ROUTES ----------
app.use('/api/dice', diceRoutes);
app.use('/api/score', scoreRoutes);

// Quick health check
app.get('/api', (req, res) => {
    res.json({
        message: 'Yatzy API is running',
        game: serializeGame(),
    });
});

// Serve front-end from project root
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
    console.log(`✅ Yatzy server listening on http://localhost:${PORT}`);
});