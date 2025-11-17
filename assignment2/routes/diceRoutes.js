// routes/diceRoutes.js
// -----------------------------------------------
// Express router responsible for all dice-related
// API endpoints used by the front-end.
// -----------------------------------------------

import express from 'express';
import {
    rollDiceHandler,
    setHoldHandler,
} from '../controllers/diceController.js';

const router = express.Router();

// POST /api/dice/roll
// Roll all non-held dice on the server and
// return the updated game state.
router.post('/roll', rollDiceHandler);

// POST /api/dice/hold
// Update the "held" flag of a single die
// (index + boolean) and return updated state.
router.post('/hold', setHoldHandler);

export default router;