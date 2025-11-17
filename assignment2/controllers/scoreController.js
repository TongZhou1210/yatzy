// controllers/scoreController.js
// -----------------------------------------------
// Scoring-related actions.
// -----------------------------------------------

import {
    placeScore,   // from gameState.js
    serializeGame,
} from '../gameState.js';

/**
 * POST /api/score
 * Body: { category: string }
 */
export function placeScoreHandler(req, res) {
    try {
        const { category } = req.body;

        if (!category || typeof category !== 'string') {
            return res.status(400).json({ error: 'category is required and must be a string' });
        }

        placeScore(category);        // apply score on the server
        const state = serializeGame();
        res.json(state);
    } catch (err) {
        res.status(400).json({
            error: err.message || 'Failed to place score',
        });
    }
}