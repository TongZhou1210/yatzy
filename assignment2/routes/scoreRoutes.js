// routes/scoreRoutes.js
// -----------------------------------------------
// Express router for scoring-related endpoints.
// -----------------------------------------------

import express from 'express';
import { placeScoreHandler } from '../controllers/scoreController.js';

const router = express.Router();

// POST /api/score
router.post('/', placeScoreHandler);

export default router;