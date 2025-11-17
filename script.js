// ============================================================
// script.js  (Assignment 2 – Client-side controller)
//
// ------------------------------------------------------------
// 1) Uses the Fetch API to call a Node.js + Express backend.
// 2) All core game state (dice values, rolls left, scores, totals,
//    held flags) is kept on the SERVER, not in the browser.
// 3) The client is now responsible ONLY for:
//      - Rendering the UI
//      - Sending user actions (roll, hold, score, reset)
//      - Updating the view from server responses
// 4) No direct Yatzy logic is calculated in the browser
//    (no more DiceSet / YatzyEngine / YatzyGame usage here).
//    All scoring is calculated on the server side.
// ============================================================

const API_BASE = '/api';

// -----------------------------
// Simple helper for JSON calls
// -----------------------------
async function apiRequest(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        // merge default headers with caller options
        ...options
    });

    if (!res.ok) {
        // Try to read error message if the server sent one
        let msg = `Request failed: ${res.status}`;
        try {
            const data = await res.json();
            if (data && data.error) msg = data.error;
        } catch (e) {
            // ignore JSON parse error, keep default msg
        }
        throw new Error(msg);
    }

    return res.json();
}

// ============================================================
// GLOBAL UI REFERENCES & CLIENT-SIDE STATE
// ============================================================
let diceEls = [];
let holdBtns = [];
let scoreCells = [];
let rollsUI;
let subtotalEl;
let bonusEl;
let totalEl;
let highScoreEl;
let btnRoll;
let btnEndTurn;
let btnEndGame;
let btnReset;

// Local copy of the server game state.
let gameState = null;

// Tracks whether the player has rolled at least once
// in the current round. This controls when we show
// selectable score previews, just like Assignment 1.
let hasRolledThisRound = false;

// High score is still kept in the browser (localStorage).
const HS_KEY = 'yatzyHighScore';
const getHighScore = () => Number(localStorage.getItem(HS_KEY) || 0);
const setHighScore = (value) => {
    localStorage.setItem(HS_KEY, String(value));
    highScoreEl.textContent = value;
};

// ============================================================
// SCORE TOOLTIP DEFINITIONS (same behavior as Assignment 1)
// ============================================================

/**
 * Human-readable explanations for each scoring category.
 * Used to show tooltips when hovering the first column in
 * the score table, matching your Assignment 1 behavior.
 */
const SCORE_TIPS = {
    'Ones': 'Add all dice showing 1.',
    'Twos': 'Add all dice showing 2.',
    'Threes': 'Add all dice showing 3.',
    'Fours': 'Add all dice showing 4.',
    'Fives': 'Add all dice showing 5.',
    'Sixes': 'Add all dice showing 6.',
    'Three of a kind': 'At least three dice the same → score = sum of all five dice.',
    'Four of a kind': 'At least four dice the same → score = sum of all five dice.',
    'Full House': 'Three of one value + two of another → 25 points.',
    'Small Straight': 'Any sequence of four (1-2-3-4, 2-3-4-5, or 3-4-5-6) → 30 points.',
    'Large Straight': 'Five in sequence (1-2-3-4-5 or 2-3-4-5-6) → 40 points.',
    'Chance': 'Any combination → score = sum of all five dice.',
    'Yatzy': 'All five dice identical → 50 points.'
};

/**
 * Attach tooltip attributes to the first column of the score
 * table (category names). This enables the CSS-based tooltip
 * bubbles that already exist in styles.css.
 */
function installScoreTips() {
    const rows = document.querySelectorAll('.score-table tbody tr');
    rows.forEach((tr) => {
        const nameCell = tr.querySelector('td:first-child');
        if (!nameCell) return;

        const label = nameCell.textContent.trim();
        const tip = SCORE_TIPS[label];
        if (!tip) return; // skip rows like Subtotal / Bonus / Total

        nameCell.classList.add('cat-name');
        nameCell.setAttribute('data-tip', tip);
        nameCell.setAttribute('title', tip);
        // Extra accessibility: screen readers will read both the label and the tip.
        nameCell.setAttribute('aria-label', `${label}: ${tip}`);
    });
}

// ============================================================
// RENDERING HELPERS
// ============================================================

/**
 * Render the held state for dice and hold buttons based on
 * the server game state (gameState.holds = [true/false,...]).
 * This keeps the UI perfectly in sync with the backend.
 */
function renderHoldsFromState() {
    if (!gameState || !Array.isArray(gameState.holds)) return;
    const holds = gameState.holds;

    holdBtns.forEach((btn, i) => {
        const isHeld = !!holds[i];
        btn.setAttribute('aria-pressed', String(isHeld));
        btn.classList.toggle('is-held', isHeld);
    });

    diceEls.forEach((die, i) => {
        const isHeld = !!holds[i];
        die.classList.toggle('is-held', isHeld);
    });
}

/**
 * Render the dice faces based on the current game state
 * returned from the server.
 *
 * Expected server field:
 *   gameState.dice = [1,2,3,4,5]
 */
function renderDice() {
    if (!gameState || !Array.isArray(gameState.dice)) return;
    const faces = gameState.dice;

    diceEls.forEach((el, i) => {
        const face = faces[i] || 1;
        const offset = -(face - 1) * 100; // sprite background shift
        el.style.animation = 'none';
        el.style.backgroundPosition = `${offset}% 0`;
    });
}

/**
 * Render the rolls-left indicator from server state.
 *
 * Expected server field:
 *   gameState.rollsLeft = number
 */
function renderRolls() {
    if (!gameState) return;
    const rollsLeft = gameState.rollsLeft ?? 0;
    rollsUI.textContent = `Rolls Left: ${rollsLeft}`;
    btnRoll.disabled = rollsLeft <= 0 || gameState.gameOver;
}

/**
 * Render the score table cells based on server state.
 *
 * Expected server fields:
 *   gameState.scores = { "Ones": number|null, ... }
 *   gameState.possibleScores = { "Ones": number|null, ... }
 *   gameState.upperSubtotal
 *   gameState.upperBonus
 *   gameState.total
 *
 * Behavior is designed to match Assignment 1:
 *   - Already-scored categories show their final value.
 *   - Before any roll in a round: no previews, all "—".
 *   - After at least one roll in a round:
 *       * highlight (selectable) categories where the
 *         preview score > 0 OR category === "Chance".
 *       * non-selectable categories remain gray "—".
 */
function renderScoreTable() {
    if (!gameState) return;

    const scores   = gameState.scores || {};
    const possible = gameState.possibleScores || {};

    scoreCells.forEach(td => {
        const cat = td.getAttribute('data-cat');
        const finalVal = scores[cat];
        const previewRaw = possible[cat];
        const preview = (typeof previewRaw === 'number') ? previewRaw : null;

        // Already scored → fixed value, not selectable
        if (typeof finalVal === 'number') {
            td.textContent = finalVal;
            td.classList.add('filled');
            td.classList.remove('selectable');
            td.setAttribute('aria-disabled', 'true');
            return;
        }

        // Not yet scored
        // If the player has not rolled yet this round, we do not
        // show any previews at all (same as Assignment 1).
        if (!hasRolledThisRound || gameState.gameOver) {
            td.textContent = '—';
            td.classList.remove('filled', 'selectable');
            td.setAttribute('aria-disabled', 'true');
            return;
        }

        // We have rolled at least once this round.
        // A cell becomes "selectable" (highlighted) if:
        //   - the preview score is > 0, OR
        //   - the category is Chance (always allowed).
        const canSelect =
            (preview !== null && preview > 0) ||
            cat === 'Chance';

        if (canSelect) {
            td.textContent = preview ?? 0;
            td.classList.remove('filled');
            td.classList.add('selectable');
            td.removeAttribute('aria-disabled');
        } else {
            td.textContent = '—';
            td.classList.remove('filled', 'selectable');
            td.setAttribute('aria-disabled', 'true');
        }
    });

    subtotalEl.textContent = gameState.upperSubtotal ?? 0;
    bonusEl.textContent    = gameState.upperBonus ?? 0;
    totalEl.textContent    = gameState.total ?? 0;

    const finalTotal = gameState.total ?? 0;
    if (finalTotal > getHighScore()) {
        setHighScore(finalTotal);
    }
}

/**
 * Render all UI parts from the current gameState.
 */
function renderAll() {
    if (!gameState) return;
    renderHoldsFromState();
    renderDice();
    renderRolls();
    renderScoreTable();

    // Show "Game Over" state by disabling buttons if needed
    if (gameState.gameOver) {
        btnRoll.disabled = true;
        btnEndTurn.disabled = true;
        btnEndGame.disabled = true;
    } else {
        btnEndTurn.disabled = false; // still allow user to choose a category
        btnEndGame.disabled = false;
    }
}

// ============================================================
// CLIENT <-> SERVER ACTIONS
// ============================================================

/**
 * Ask the server to start a brand new game.
 * Corresponding backend endpoint should reset all game state
 * and return the initial state.
 *
 * POST /api/game/new
 */
async function startNewGameFromServer() {
    gameState = await apiRequest('/game/new', { method: 'POST' });

    // New game → no rolls yet
    hasRolledThisRound = false;
    renderAll();
}

/**
 * Ask the server to return the latest game state.
 * GET /api/game/state
 */
async function refreshGameStateFromServer() {
    gameState = await apiRequest('/game/state', { method: 'GET' });

    // Infer whether the player has already rolled in the current round:
    // if rollsLeft < 3 and game is not over, we must have rolled at least once.
    if (gameState && !gameState.gameOver) {
        hasRolledThisRound = (gameState.rollsLeft < 3);
    } else {
        hasRolledThisRound = false;
    }

    renderAll();
}

/**
 * Ask the server to roll the dice.
 * This should:
 *  - Decrease rollsLeft on the server
 *  - Generate new dice values (for non-held dice)
 *  - Return the updated game state
 *
 * POST /api/dice/roll
 */
async function rollDiceOnServer() {
    // Prevent rolling when no state or game over
    if (!gameState || gameState.rollsLeft <= 0 || gameState.gameOver) {
        alert('No rolls left or game is over. Please select a score or start a new game.');
        return;
    }

    // Simple animation: spin non-held dice
    diceEls.forEach((d, index) => {
        const isHeld = Array.isArray(gameState.holds) ? !!gameState.holds[index] : false;
        d.style.animation = isHeld ? 'none' : 'roll 700ms steps(6) infinite';
    });
    btnRoll.disabled = true;

    // After animation, call the server
    setTimeout(async () => {
        try {
            gameState = await apiRequest('/dice/roll', { method: 'POST' });

            // We have definitely rolled at least once in this round now
            if (gameState && !gameState.gameOver) {
                hasRolledThisRound = true;
            }

            renderAll();
        } catch (err) {
            alert(`Roll failed: ${err.message}`);
        } finally {
            // stop animation
            diceEls.forEach(d => d.style.animation = 'none');
        }
    }, 700);
}

/**
 * Ask the server to update hold status for ONE die.
 * The server should update its internal "held" array
 * and return an updated game state or at least confirm success.
 *
 * POST /api/dice/hold
 * Body: { index: number, held: boolean }
 */
async function setHoldOnServer(index, isHeld) {
    try {
        gameState = await apiRequest('/dice/hold', {
            method: 'POST',
            body: JSON.stringify({ index, held: isHeld })
        });

        // Server becomes the source of truth for held state
        renderAll();
    } catch (err) {
        alert(`Failed to update hold: ${err.message}`);
    }
}

/**
 * Ask the server to place a score for a category.
 *
 * POST /api/score
 * Body: { category: string }
 *
 * The server should:
 *  - Check if the category is still available
 *  - Calculate the score for the current dice
 *  - Update score table, round, rollsLeft, gameOver, held flags
 *  - Return the updated state
 */
async function placeScoreOnServer(category) {
    if (!gameState || gameState.gameOver) return;

    try {
        gameState = await apiRequest('/score', {
            method: 'POST',
            body: JSON.stringify({ category })
        });

        // After recording a score, we start a brand-new round,
        // so we treat it as "no roll yet" until the player rolls again.
        hasRolledThisRound = false;
        renderAll();

        // If the game just ended, show a final message
        if (gameState.gameOver) {
            const final = gameState.total ?? 0;
            const beat  = final > getHighScore();
            alert(
                beat
                    ? `🎉 New High Score! ${final}`
                    : `Your final score: ${final}. High Score: ${getHighScore()}`
            );
        }
    } catch (err) {
        alert(`Cannot score category "${category}": ${err.message}`);
    }
}

/**
 * Ask the server to end the game immediately.
 * POST /api/game/end
 */
async function endGameOnServer() {
    if (!gameState || gameState.gameOver) return;

    try {
        gameState = await apiRequest('/game/end', { method: 'POST' });

        // Game is over → do not show previews
        hasRolledThisRound = false;
        renderAll();

        const final = gameState.total ?? 0;
        const beat  = final > getHighScore();
        alert(
            beat
                ? `🎉 New High Score! ${final}`
                : `Your final score: ${final}. High Score: ${getHighScore()}`
        );
    } catch (err) {
        alert(`Failed to end game: ${err.message}`);
    }
}

// ============================================================
// UI WIRING – DOMContentLoaded
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    // --------------------------
    // 1) Grab all DOM elements
    // --------------------------
    btnRoll     = document.getElementById('btn-roll');
    btnEndTurn  = document.getElementById('btn-end-turn');
    btnEndGame  = document.getElementById('btn-end');
    btnReset    = document.getElementById('btn-reset');

    diceEls     = Array.from(document.querySelectorAll('.die'));
    holdBtns    = Array.from(document.querySelectorAll('.hold-toggle'));
    rollsUI     = document.getElementById('rolls-indicator');

    highScoreEl = document.getElementById('high-score');
    subtotalEl  = document.getElementById('subtotal-score');
    totalEl     = document.getElementById('total-score');
    bonusEl     = document.getElementById('upper-bonus');

    scoreCells  = Array.from(document.querySelectorAll('.score-cell'));

    // Install tooltips for category name cells (left column),
    // same visual behavior as in Assignment 1.
    installScoreTips();

    // Initialize high score text from localStorage
    highScoreEl.textContent = getHighScore();

    // --------------------------
    // 2) Attach event listeners
    // --------------------------

    // Hold buttons: update UI immediately for responsiveness,
    // then notify server. The server will return the latest
    // state and renderAll() will re-sync UI if needed.
    holdBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const idx = Number(btn.getAttribute('data-for')) - 1;
            const nowHeld = btn.getAttribute('aria-pressed') !== 'true';

            // Optimistic UI update
            btn.setAttribute('aria-pressed', String(nowHeld));
            btn.classList.toggle('is-held', nowHeld);
            diceEls[idx].classList.toggle('is-held', nowHeld);

            // Update server state
            await setHoldOnServer(idx, nowHeld);
        });
    });

    // Roll button → POST /api/dice/roll
    btnRoll.addEventListener('click', () => {
        rollDiceOnServer();
    });

    // End Turn button: in this simplified version we just remind
    // the player to select a category (server enforces rules).
    btnEndTurn.addEventListener('click', () => {
        alert('Please click on a score category in the table to record your score for this round.');
    });

    // End Game button → POST /api/game/end
    btnEndGame.addEventListener('click', () => {
        endGameOnServer();
    });

    // Reset button → POST /api/game/new
    btnReset.addEventListener('click', () => {
        startNewGameFromServer();
    });

    // Score cells: click to choose category
    scoreCells.forEach(td => {
        td.addEventListener('click', () => {
            if (!gameState || gameState.gameOver) return;

            // Do not allow overwriting filled categories
            if (td.classList.contains('filled')) return;

            // Only allow click when currently selectable
            if (!td.classList.contains('selectable')) return;

            const cat = td.getAttribute('data-cat');
            placeScoreOnServer(cat);
        });
    });

    // --------------------------
    // 3) Load initial server state
    // --------------------------
    try {
        // Try to fetch existing game; if none, start a new one
        gameState = await apiRequest('/game/state', { method: 'GET' });
    } catch (e) {
        // If state not available, create a new game
        gameState = await apiRequest('/game/new', { method: 'POST' });
    }

    // Infer whether we have already rolled in this round
    if (gameState && !gameState.gameOver) {
        hasRolledThisRound = (gameState.rollsLeft < 3);
    } else {
        hasRolledThisRound = false;
    }

    renderAll();
});