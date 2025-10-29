// ============================================================
// yatzyEngine.js
// ============================================================
// PURPOSE
//   Implements scoring logic for all Yatzy/Yahtzee categories.
//   Keeps scoring rules separate from UI and dice-rolling code,
//   which improves code quality and maintainability.
//
// HOW THIS SUPPORTS THE ASSIGNMENT
//   • Implements required categories (upper + lower section).
//   • Provides a pure function-like API to calculate scores
//     from a 5-die roll (game-state friendly).
//   • Tracks which categories have been used (score once).
//   • Exposes helpers for subtotals, optional upper bonus,
//     and grand total.
//
// NOTES
//   • Upper-section bonus: classic rules award +35 points if
//     Ones–Sixes total >= 63. Included here as a helper so
//     the UI can choose to show/apply it.
// ============================================================

// ---- Category names (frozen for safety) --------------------
export const Categories = Object.freeze({
    ONES: 'Ones',
    TWOS: 'Twos',
    THREES: 'Threes',
    FOURS: 'Fours',
    FIVES: 'Fives',
    SIXES: 'Sixes',
    THREE_KIND: 'Three of a kind',
    FOUR_KIND: 'Four of a kind',
    FULL_HOUSE: 'Full House',
    SMALL_STRAIGHT: 'Small Straight',
    LARGE_STRAIGHT: 'Large Straight',
    CHANCE: 'Chance',
    YATZY: 'Yatzy'
});

// ---- Constants used by the lower section & bonus -----------
const FULL_HOUSE_POINTS     = 25;
const SMALL_STRAIGHT_POINTS = 30;
const LARGE_STRAIGHT_POINTS = 40;
const YATZY_POINTS          = 50;

const UPPER_BONUS_THRESHOLD = 63; // Ones–Sixes subtotal needed
const UPPER_BONUS_POINTS    = 35; // Bonus awarded if threshold met

export class YatzyEngine {
    constructor() {
        // Map<string, number|null> – null means "not yet scored"
        this.scoreTable = new Map(Object.values(Categories).map(c => [c, null]));
    }

    // ==========================================================
    // Helpers (pure utilities)
    // ==========================================================

    /**
     * Validates and normalizes a 5-die roll.
     * @param {number[]} diceValues - array of length 5, values 1..6
     * @returns {number[]|null} a safe copy or null if invalid
     */
    static normalizeDice(diceValues) {
        if (!Array.isArray(diceValues) || diceValues.length !== 5) return null;
        for (const v of diceValues) {
            if (!Number.isInteger(v) || v < 1 || v > 6) return null;
        }
        return [...diceValues];
    }

    /**
     * Counts occurrences of each face (1..6).
     * @param {number[]} dice
     * @returns {{1:number,2:number,3:number,4:number,5:number,6:number}}
     */
    static counts(dice) {
        const cnt = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
        for (const v of dice) cnt[v]++;
        return cnt;
    }

    /** Sum of all five dice. */
    static sum(dice) {
        return dice.reduce((a, b) => a + b, 0);
    }

    /** True if any face appears at least n times. */
    static hasNOfAKind(counts, n) {
        return Object.values(counts).some(c => c >= n);
    }

    /**
     * Full House rule:
     *   Exactly 3 of one face + exactly 2 of another.
     *   (Five of a kind does NOT count as a full house.)
     */
    static isFullHouse(counts) {
        const vals = Object.values(counts);
        return vals.includes(3) && vals.includes(2);
    }

    /**
     * Small Straight rule:
     *   Contains any of the sets {1,2,3,4}, {2,3,4,5}, {3,4,5,6}
     *   (Order and duplicates do not matter.)
     */
    static isSmallStraight(dice) {
        const s = new Set(dice);
        const seqs = [
            [1,2,3,4],
            [2,3,4,5],
            [3,4,5,6]
        ];
        return seqs.some(seq => seq.every(n => s.has(n)));
    }

    /**
     * Large Straight rule:
     *   Exactly {1,2,3,4,5} or {2,3,4,5,6} (five unique in sequence).
     */
    static isLargeStraight(dice) {
        const s = new Set(dice);
        if (s.size !== 5) return false;
        const a = [1,2,3,4,5];
        const b = [2,3,4,5,6];
        const eq = (arr) => arr.every(n => s.has(n));
        return eq(a) || eq(b);
    }

    // ==========================================================
    // Scoring
    // ==========================================================

    /**
     * Calculates the score for a specific category from a roll.
     * Returns 0 if the roll does not satisfy the category.
     *
     * @param {string} category - one of Categories.*
     * @param {number[]} diceValues - array of 5 ints in [1..6]
     * @returns {number}
     */
    calculateScore(category, diceValues) {
        const dice = YatzyEngine.normalizeDice(diceValues);
        if (!dice) return 0;

        const counts = YatzyEngine.counts(dice);
        const total  = YatzyEngine.sum(dice);

        switch (category) {
            // Upper section (sum of matching faces)
            case Categories.ONES:   return dice.filter(v => v === 1).length * 1;
            case Categories.TWOS:   return dice.filter(v => v === 2).length * 2;
            case Categories.THREES: return dice.filter(v => v === 3).length * 3;
            case Categories.FOURS:  return dice.filter(v => v === 4).length * 4;
            case Categories.FIVES:  return dice.filter(v => v === 5).length * 5;
            case Categories.SIXES:  return dice.filter(v => v === 6).length * 6;

            // Lower section
            case Categories.THREE_KIND:
                return YatzyEngine.hasNOfAKind(counts, 3) ? total : 0;

            case Categories.FOUR_KIND:
                return YatzyEngine.hasNOfAKind(counts, 4) ? total : 0;

            case Categories.FULL_HOUSE:
                return YatzyEngine.isFullHouse(counts) ? FULL_HOUSE_POINTS : 0;

            case Categories.SMALL_STRAIGHT:
                return YatzyEngine.isSmallStraight(dice) ? SMALL_STRAIGHT_POINTS : 0;

            case Categories.LARGE_STRAIGHT:
                return YatzyEngine.isLargeStraight(dice) ? LARGE_STRAIGHT_POINTS : 0;

            case Categories.CHANCE:
                return total;

            case Categories.YATZY:
                // All five dice identical (5 of a kind)
                return Object.values(counts).some(c => c === 5) ? YATZY_POINTS : 0;

            default:
                return 0;
        }
    }

    /**
     * Returns false if the category has already been scored.
     * Optionally, you can enforce “strict” validity by requiring
     * the current roll to actually satisfy the category.
     *
     * @param {string} category
     * @param {number[]} diceValues
     * @returns {boolean}
     */
    isValidSelection(category, diceValues) {
        if (this.scoreTable.get(category) != null) return false; // already used

        // Strict mode (uncomment to enforce):
        // return this.calculateScore(category, diceValues) > 0 || category === Categories.CHANCE;

        return true; // non-strict: allow zero scores when player chooses
    }

    /**
     * Writes the score once (no overwrite).
     * Safe-guards against accidental double-scoring.
     *
     * @param {string} category
     * @param {number} value
     */
    setScore(category, value) {
        if (this.scoreTable.get(category) == null) {
            this.scoreTable.set(category, value);
        }
    }

    // ==========================================================
    // Totals & Bonus helpers (useful for UI)
    // ==========================================================

    /** Upper-section subtotal (Ones..Sixes). */
    upperSubtotal() {
        let sum = 0;
        sum += this.scoreTable.get(Categories.ONES)   ?? 0;
        sum += this.scoreTable.get(Categories.TWOS)   ?? 0;
        sum += this.scoreTable.get(Categories.THREES) ?? 0;
        sum += this.scoreTable.get(Categories.FOURS)  ?? 0;
        sum += this.scoreTable.get(Categories.FIVES)  ?? 0;
        sum += this.scoreTable.get(Categories.SIXES)  ?? 0;
        return sum;
    }

    /** Returns +35 if upper subtotal >= 63, else 0. */
    upperBonus() {
        return this.upperSubtotal() >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_POINTS : 0;
    }

    /** Lower-section subtotal (everything except Ones..Sixes). */
    lowerSubtotal() {
        let sum = 0;
        for (const [key, val] of this.scoreTable.entries()) {
            if (key === Categories.ONES || key === Categories.TWOS ||
                key === Categories.THREES || key === Categories.FOURS ||
                key === Categories.FIVES || key === Categories.SIXES) {
                continue;
            }
            if (typeof val === 'number') sum += val;
        }
        return sum;
    }

    /**
     * Grand total: upper subtotal + bonus + lower subtotal.
     * This mirrors standard Yatzy scoring sheets.
     */
    total() {
        return this.upperSubtotal() + this.upperBonus() + this.lowerSubtotal();
    }

    /**
     * Convenience: returns a list of categories that are still open.
     * Useful for driving UI (e.g., enabling buttons).
     */
    availableCategories() {
        const out = [];
        for (const [cat, val] of this.scoreTable.entries()) {
            if (val == null) out.push(cat);
        }
        return out;
    }
}