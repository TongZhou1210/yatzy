// controllers/diceController.js
// -----------------------------------------------
// Dice-related controller functions.
// -----------------------------------------------

import {
    rollDice,     // from gameState.js
    setHold,
    serializeGame,
} from '../gameState.js';

/**
 * POST /api/dice/roll
 */
export function rollDiceHandler(req, res) {
    try {
        rollDice(); // update server-side dice + rollsLeft
        const state = serializeGame();
        res.json(state);
    } catch (err) {
        res.status(400).json({ error: err.message || 'Failed to roll dice' });
    }
}

/**
 * POST /api/dice/hold
 * Body: { index: number, held: boolean }
 */
export function setHoldHandler(req, res) {
    try {
        const { index, held } = req.body;

        if (typeof index !== 'number') {
            return res.status(400).json({ error: 'index must be a number' });
        }

        setHold(index, !!held);
        const state = serializeGame();
        res.json(state);
    } catch (err) {
        res.status(400).json({ error: err.message || 'Failed to update hold state' });
    }
}