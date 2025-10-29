// ============================================================
// dice.js
// ============================================================
// PURPOSE:
//   This module defines the DiceSet class — responsible for
//   simulating the five dice used in a Yatzy game.
//
// HOW IT MEETS ASSIGNMENT REQUIREMENTS:
//   • Supports “Player must be able to roll five dice”.
//   • Supports “Player must be able to keep specific dice
//     and re-roll the rest” (through held flags).
//   • Keeps dice state separate from UI (modular structure
//     improves code quality & maintainability).
//   • Easily imported into yatzyGame.js for state management.
//
// ============================================================

export class DiceSet {

    /**
     * Create a set of dice for Yatzy.
     * @param {number} count - Number of dice in the game (default = 5).
     */
    constructor(count = 5) {
        // Number of dice (Yatzy standard = 5)
        this.count = count;

        // Current face values of dice; starts with all 1s.
        this.values = Array(count).fill(1);

        // Track which dice are being held (true = held / false = free).
        // This supports the "keep dice and re-roll the rest" requirement.
        this.held = Array(count).fill(false);
    }

    /**
     * Roll all dice that are not currently held.
     * Generates random integers between 1 and 6 (inclusive).
     * Returns a new array of current face values.
     *
     * This directly fulfills:
     *   - "Player must be able to roll five dice."
     *   - "Player must be able to keep specific dice and re-roll the rest."
     */
    roll() {
        for (let i = 0; i < this.count; i++) {
            if (!this.held[i]) {
                // Math.random() * 6 → random 0–5, +1 → 1–6 inclusive
                this.values[i] = 1 + Math.floor(Math.random() * 6);
            }
        }
        // Return a shallow copy so external code cannot mutate directly
        return [...this.values];
    }

    /**
     * Toggle or explicitly set a die as held/unheld.
     * @param {number} index - Index of die (0–4)
     * @param {boolean} isHeld - Whether this die should be held.
     *
     * Not strictly required by assignment, but prepares
     * for the "keep dice" functionality and future upgrades.
     */
    setHeld(index, isHeld) {
        if (index >= 0 && index < this.count) {
            this.held[index] = !!isHeld;
        }
    }

    /**
     * Reset all dice to initial state:
     * - All faces set to 1.
     * - All holds cleared.
     *
     * This is useful when the player clicks "Reset" or "End Game",
     * meeting the requirement for "resetting game state".
     */
    reset() {
        this.values.fill(1);
        this.held.fill(false);
    }

    /**
     * Returns the current dice faces as a copy.
     * (Helper method for UI rendering.)
     */
    getValues() {
        return [...this.values];
    }
}