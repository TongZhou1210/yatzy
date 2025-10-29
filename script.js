// ============================================================
// script.js — UI Controller for Yatzy Game
// ============================================================
// PURPOSE:
//   - Wires the DOM with the logic modules (DiceSet, YatzyGame, YatzyEngine).
//   - Implements full UI interactions: roll, hold, scoring, reset, and highlights.
//   - Adds hover tooltips explaining each scoring rule (user guidance feature).
// ============================================================

export function setupUI(YatzyGame, DiceSet, YatzyEngine, Categories) {
    // ----- DOM References -----
    const btnRoll     = document.getElementById('btn-roll');
    const btnEndTurn  = document.getElementById('btn-end-turn');
    const btnEndGame  = document.getElementById('btn-end');
    const btnReset    = document.getElementById('btn-reset');

    const diceEls     = Array.from(document.querySelectorAll('.die'));
    const holdBtns    = Array.from(document.querySelectorAll('.hold-toggle'));
    const rollsUI     = document.getElementById('rolls-indicator');

    const highScoreEl = document.getElementById('high-score');
    const subtotalEl  = document.getElementById('subtotal-score');
    const totalEl     = document.getElementById('total-score');

    // All clickable score cells (2nd column), each has data-cat="Category Name"
    const scoreCells  = Array.from(document.querySelectorAll('.score-cell'));

    // ----- Game State -----
    const game = new YatzyGame();
    let hasRolledThisRound = false; // only show highlights after first roll in a round

    // ----- High Score Handling -----
    const HS_KEY = 'yatzyHighScore';
    const getHS = () => Number(localStorage.getItem(HS_KEY) || 0);
    const setHS = (v) => { localStorage.setItem(HS_KEY, String(v)); highScoreEl.textContent = v; };

    // ============================================================
    // Tooltip Definitions for Score Explanations (hover on 1st column)
    // ============================================================
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

    function installScoreTips() {
        const rows = document.querySelectorAll('.score-table tbody tr');
        rows.forEach(tr => {
            const nameCell = tr.querySelector('td:first-child');
            if (!nameCell) return;
            const label = nameCell.textContent.trim();
            if (!SCORE_TIPS[label]) return; // skip subtotal/total
            nameCell.classList.add('cat-name');
            nameCell.setAttribute('data-tip', SCORE_TIPS[label]);
            nameCell.setAttribute('title', SCORE_TIPS[label]);
            nameCell.setAttribute('aria-label', `${label}: ${SCORE_TIPS[label]}`);
        });
    }

    // ============================================================
    // Rendering Helpers
    // ============================================================
    function renderDice() {
        const faces = game.getDiceValues();
        diceEls.forEach((el, i) => {
            const offset = -(faces[i] - 1) * 100;
            el.style.animation = 'none';
            el.style.backgroundPosition = `${offset}% 0`;
        });
    }

    function renderRolls() {
        rollsUI.textContent = `Rolls Left: ${game.getRollsLeft()}`;
        btnRoll.disabled = game.getRollsLeft() <= 0;
    }

    function renderTotals() {
        subtotalEl.textContent = game.engine.upperSubtotal();
        totalEl.textContent    = game.engine.total();
        const finalTotal = game.engine.total();
        if (finalTotal > getHS()) setHS(finalTotal);
    }

    function clearHoldUIAndState() {
        // Clear UI on buttons and dice faces
        holdBtns.forEach(b => {
            b.setAttribute('aria-pressed', 'false');
            b.classList.remove('is-held');
        });
        diceEls.forEach(d => d.classList.remove('is-held'));
        // Clear game state
        for (let i = 0; i < game.dice.count; i++) game.dice.setHeld(i, false);
    }

    function renderScoreTableCells() {
        // Paint already-filled cells and reset non-filled to neutral "—"
        scoreCells.forEach(td => {
            const cat = td.getAttribute('data-cat');
            const val = game.engine.scoreTable.get(cat);
            if (typeof val === 'number') {
                td.textContent = val;
                td.classList.add('filled');
                td.classList.remove('selectable');
                td.removeAttribute('tabindex');
                td.setAttribute('aria-disabled', 'true');
            } else {
                td.textContent = '—';
                td.classList.remove('filled', 'selectable');
                td.removeAttribute('aria-disabled');
                td.removeAttribute('tabindex');
            }
        });
        renderTotals();
    }

    // ============================================================
    // Highlight “selectable” categories after each roll
    // ------------------------------------------------------------
    // IMPORTANT CHANGE:
    //   clear all previous selectable styles and texts for
    //   not-filled cells, then recompute based on CURRENT dice faces.
    //   This guarantees the second/third roll re-highlights correctly.
    // ============================================================
    function updateSelectableHighlights() {
        // Before any roll in a round: nothing highlighted
        if (!hasRolledThisRound) {
            scoreCells.forEach(td => {
                if (!td.classList.contains('filled')) {
                    td.textContent = '—';
                    td.classList.remove('selectable');
                    td.removeAttribute('tabindex');
                    td.setAttribute('aria-disabled', 'true');
                }
            });
            return;
        }

        // Step 1: clear all non-filled cells to a neutral state
        scoreCells.forEach(td => {
            if (!td.classList.contains('filled')) {
                td.textContent = '—';
                td.classList.remove('selectable');
                td.removeAttribute('tabindex');
                td.setAttribute('aria-disabled', 'true');
            }
        });

        // Step 2: recompute potentials for CURRENT dice and set selectable
        const faces = game.getDiceValues();
        scoreCells.forEach(td => {
            if (td.classList.contains('filled')) return;
            const cat = td.getAttribute('data-cat');
            const potential = game.engine.calculateScore(cat, faces);
            const selectable = (potential > 0) || (cat === Categories.CHANCE);
            if (selectable) {
                td.textContent = potential;      // show points to help decision
                td.classList.add('selectable');  // button-like highlight
                td.setAttribute('tabindex', '0');
                td.removeAttribute('aria-disabled');
            }
        });
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================
    highScoreEl.textContent = getHS();
    renderDice();
    renderRolls();
    renderScoreTableCells();
    installScoreTips();
    updateSelectableHighlights(); // none before first roll

    // ============================================================
    // EVENT HANDLERS
    // ============================================================

    // --- Hold buttons ---
    holdBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const i = Number(btn.getAttribute('data-for')) - 1;
            const nowHeld = btn.getAttribute('aria-pressed') !== 'true';

            // Update hold button UI
            btn.setAttribute('aria-pressed', String(nowHeld));
            btn.classList.toggle('is-held', nowHeld);

            // Update die face UI to show a held state (prevents animation confusion)
            diceEls[i].classList.toggle('is-held', nowHeld);

            // Update game state
            game.dice.setHeld(i, nowHeld);

            // We do NOT recompute highlights here; they refresh on next roll.
        });
    });

    // --- Roll Dice ---
    btnRoll.addEventListener('click', () => {
        if (game.getRollsLeft() <= 0) return;

        // Animate only non-held dice to avoid confusing the player
        diceEls.forEach((d, idx) => {
            d.style.animation = game.dice.held[idx] ? 'none' : 'roll 700ms steps(6) infinite';
        });
        btnRoll.disabled = true;

        setTimeout(() => {
            game.rollDice();            // logic roll (respects held[])
            hasRolledThisRound = true;  // from now on we can highlight

            // Always re-render dice/rolls
            renderDice();
            renderRolls();

            //  reset score cells visually, then recompute highlights
            // This ensures second/third roll updates the options correctly.
            renderScoreTableCells();      // reset non-filled cells back to "—"
            updateSelectableHighlights(); // then apply potentials for CURRENT dice

            btnRoll.disabled = game.getRollsLeft() <= 0;
        }, 700);
    });

    // --- Click a score cell to record score ---
    scoreCells.forEach(td => {
        td.addEventListener('click', () => {
            // Only allow click when this cell is currently selectable
            if (!td.classList.contains('selectable')) return;

            const cat = td.getAttribute('data-cat');
            const ok = game.placeScore(cat);
            if (!ok) return;

            // Lock the value in the table
            const val = game.engine.scoreTable.get(cat);
            td.textContent = val;
            td.classList.remove('selectable');
            td.classList.add('filled');

            // Prepare next round visuals/state
            hasRolledThisRound = false;
            renderRolls();
            clearHoldUIAndState();  // clears UI and state for holds
            renderTotals();

            // After scoring, no highlights until the next roll
            updateSelectableHighlights();
            btnRoll.disabled = false;
        });
    });

    // --- End Turn (without scoring) ---
    btnEndTurn.addEventListener('click', () => {
        // If you want to enforce "must score once per round", block this.
        game.round++;
        game.rollsLeft = 3;
        hasRolledThisRound = false;

        clearHoldUIAndState();
        renderRolls();

        // Clear any previous highlight until next roll
        renderScoreTableCells();
        updateSelectableHighlights();

        btnRoll.disabled = false;
    });

    // --- End Game ---
    btnEndGame.addEventListener('click', () => {
        const final = game.endGame();
        renderTotals();
        alert(`Your final score: ${final}. High Score: ${getHS()}`);
        hasRolledThisRound = false;
        renderScoreTableCells();
        updateSelectableHighlights();
    });

    // --- Reset / New Game ---
    btnReset.addEventListener('click', () => {
        game.startNewGame();
        hasRolledThisRound = false;

        clearHoldUIAndState();
        renderDice();
        renderRolls();
        renderScoreTableCells();
        updateSelectableHighlights();

        btnRoll.disabled = false;
    });
}