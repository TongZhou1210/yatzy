// ------------------------------------------------------------
// Central server-side game state manager.
//  - Holds ONE global YatzyGame instance
//  - Exposes simple functions (newGame, rollDice, setHold,
//    placeScore, endGame) for controllers & server.js
//  - Serializes the state into the JSON shape required by
//    assignment2/script.js on the client.
// ------------------------------------------------------------

import { YatzyGame } from '../js/yatzyGame.js';

// Single in-memory game (single-player demo).
let game = new YatzyGame();

// ------------------------------------------------------------
// Basic accessors
// ------------------------------------------------------------

export function getGame() {
    return game;
}

/** Start a brand-new game */
export function newGame() {
    game = new YatzyGame();
    return game;
}

// ------------------------------------------------------------
// Server-side game actions (thin wrappers)
// ------------------------------------------------------------

/** Roll all non-held dice (decrements rollsLeft) */
export function rollDice() {
    return game.rollDice();
}

/** Set hold status for one die */
export function setHold(index, held) {
    game.dice.setHeld(index, held);
    return game;
}

/** Place score for a category (throws if invalid) */
export function placeScore(category) {
    const ok = game.placeScore(category);
    if (!ok) {
        throw new Error(`Cannot place score for category: ${category}`);
    }
    return game;
}

/** End the current game */
export function endGame() {
    game.endGame();
    return game;
}

// ------------------------------------------------------------
// Serialize current state → JSON for the client
// ------------------------------------------------------------

export function serializeGame() {
    const diceValues = game.getDiceValues();

    const scoresObj = {};
    for (const [cat, val] of game.engine.scoreTable.entries()) {
        scoresObj[cat] = val;
    }

    const possibleObj = {};
    for (const [cat, val] of game.engine.scoreTable.entries()) {
        if (val == null) {
            possibleObj[cat] = game.engine.calculateScore(cat, diceValues);
        } else {
            possibleObj[cat] = null;
        }
    }

    // Expose current hold flags so the client can render the
    // held state exactly like Assignment 1.
    const holds = Array.isArray(game.dice?.held)
        ? [...game.dice.held]
        : new Array(diceValues.length).fill(false);

    return {
        dice: diceValues,
        holds,
        rollsLeft: game.getRollsLeft(),
        gameOver: game.gameOver,

        scores: scoresObj,
        possibleScores: possibleObj,

        upperSubtotal: game.engine.upperSubtotal(),
        upperBonus: game.engine.upperBonus(),
        total: game.engine.total(),

        // Extra info
        round: game.round,
        availableCategories: game.getAvailableCategories()
    };
}