// ============================================================
// yatzyGame.js
// ============================================================
// PURPOSE
//   This module coordinates the entire Yatzy game state.
//   It connects dice rolling (DiceSet) and scoring logic (YatzyEngine)
//   into a complete playable single-player round.
//
// HOW THIS FILE MEETS ASSIGNMENT REQUIREMENTS
//   • Tracks rounds, rolls, and available categories (game logic).
//   • Resets game state correctly when "Start New Game" or
//     "End Game" is pressed.
//   • Prevents rolling after the game ends or when out of rolls.
//   • Calculates and records scores per category.
//   • Supports responsive UI updates through clean public methods.
//
//   Separation of concerns: the UI (index.html + script.js)
//   only calls these methods, while all logic remains here.
// ============================================================

import { DiceSet } from './dice.js';
import { YatzyEngine, Categories } from './yatzyEngine.js';

export class YatzyGame {

    constructor() {
        // Create a new 5-dice set and scoring engine
        this.dice = new DiceSet(5);
        this.engine = new YatzyEngine();

        // Game tracking variables
        this.round = 1;        // 13 total possible rounds (categories)
        this.rollsLeft = 3;    // Max 3 rolls per round
        this.gameOver = false; // Locked once all categories filled
    }

    /**
     * Initializes a completely new game session.
     * Resets dice, clears score table, and restarts counters.
     *
     * Fulfills: "Player can reset or start new game."
     */
    startNewGame() {
        this.dice.reset();
        this.engine = new YatzyEngine();
        this.round = 1;
        this.rollsLeft = 3;
        this.gameOver = false;
    }

    /**
     * Rolls all non-held dice.
     * Decreases remaining roll count.
     * Prevents rolling if the game is finished or out of rolls.
     *
     * Fulfills: "Player can roll the dice up to three times per turn."
     *
     * @returns {number[]} new dice face values
     */
    rollDice() {
        if (this.rollsLeft <= 0 || this.gameOver) {
            return this.dice.getValues();
        }
        this.rollsLeft--;
        return this.dice.roll();
    }

    /**
     * Calculates and records a score for the chosen category.
     * Prevents re-using a category.
     *
     * Fulfills: "Each round must record a score in one category."
     *
     * @param {string} category - One of Categories.*
     * @returns {boolean} true if successfully recorded, false if invalid
     */
    placeScore(category) {
        if (!this.engine.isValidSelection(category, this.dice.getValues())) {
            return false; // either used or invalid
        }

        const score = this.engine.calculateScore(category, this.dice.getValues());
        this.engine.setScore(category, score);

        this.endTurn();
        return true;
    }

    /**
     * Ends the current round and prepares the next one.
     * Resets roll count. If all categories filled, ends the game.
     */
    endTurn() {
        this.round++;
        this.rollsLeft = 3;

        const allFilled = [...this.engine.scoreTable.values()].every(v => v !== null);
        if (allFilled) this.endGame();
    }

    /**
     * Marks the game as finished.
     * Returns the player’s final total score.
     *
     * Fulfills: "At game end, display final and high score."
     */
    endGame() {
        this.gameOver = true;
        return this.engine.total();
    }

    /**
     * Convenience getter for current dice state.
     * Used by the UI to render dice faces.
     */
    getDiceValues() {
        return this.dice.getValues();
    }

    /**
     * Returns the number of rolls still available this round.
     * Used by UI indicator "Rolls Left".
     */
    getRollsLeft() {
        return this.rollsLeft;
    }

    /**
     * Returns the current running total for display.
     * (Used by live scoreboard updates.)
     */
    getTotalScore() {
        return this.engine.total();
    }

    /**
     * Exposes open categories for UI button enable/disable logic.
     */
    getAvailableCategories() {
        return this.engine.availableCategories();
    }
}

// Re-export Categories so the UI layer can use the same reference.
export { Categories };