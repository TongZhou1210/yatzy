# 🎲 Yatzy – Single-Player Game
CST3106 Assignment 1

A modular, browser-based single-player implementation of **Yatzy (Yahtzee)** built using **HTML, CSS, and JavaScript ES Modules**.  
The player rolls dice, holds selected dice between rolls, and fills in 13 scoring categories to achieve the highest score possible.
---

## 🚀 How to Run
Right-click index.html → Open in Browser or use the built-in HTTP Server.

## 📖 Game Rules

1. **Dice Rolling**
    - Each turn, the player rolls **five dice**.
    - The player may roll the dice **three times per turn**.
    - After rolling, the player can choose to **keep some dice** and re-roll the rest.

2. **Scoring**
    - The scorecard has two sections: **Upper Section** and **Lower Section**.

   **Upper Section**
    - **Ones (1s)** → Add all dice showing 1.
    - **Twos (2s)** → Add all dice showing 2.
    - **Threes (3s)** → Add all dice showing 3.
    - **Fours (4s)** → Add all dice showing 4.
    - **Fives (5s)** → Add all dice showing 5.
    - **Sixes (6s)** → Add all dice showing 6.
    - **Bonus:** If the total of Ones–Sixes ≥ **63**, add a **+35 point bonus** automatically.

   👉 Example: if you roll **2, 2, 5, 6, 6**:
    - If you choose **Twos**, your score = 2 + 2 = **4 points**
    - If you choose **Sixes**, your score = 6 + 6 = **12 points**

   **Lower Section**
    - **Three-of-a-Kind** → At least 3 dice the same → Score = sum of all 5 dice.
    - **Four-of-a-Kind** → At least 4 dice the same → Score = sum of all 5 dice.
    - **Full House** → A pair + three-of-a-kind (e.g., 2-2-3-3-3) → **25 points**.
    - **Small Straight** → Sequence of 4 numbers (e.g., 1-2-3-4 or 3-4-5-6) → **30 points**.
    - **Large Straight** → Sequence of 5 numbers (1-2-3-4-5 or 2-3-4-5-6) → **40 points**.
    - **Chance** → Any combination, score = sum of all 5 dice (flexible “wild card”).
    - **Yatzy** → All 5 dice identical (e.g., 6-6-6-6-6) → **50 points**.

3. **Turns and Game End**
    - Each turn, the player must record a score in one available category.
    - Each player has a maximum of **13 rounds** (one for each category).
    - The game ends when all categories are filled or when the player chooses to end early.
    - The game displays:
        - The **final score**
        - A message: 🎉 Congratulatory if the player beats their high score, 😢 Consolation if not.

---
## 🧮 Scoring Summary

| Category | Description | Points |
|-----------|--------------|--------|
| Ones–Sixes | Sum of dice showing that number | Sum |
| **Bonus** | If upper total ≥ 63 | +35 |
| 3 of a Kind | At least 3 same dice, sum of all 5 | Total |
| 4 of a Kind | At least 4 same dice, sum of all 5 | Total |
| Full House | 3 of one + 2 of another | 25 |
| Small Straight | Sequence of 4 | 30 |
| Large Straight | Sequence of 5 | 40 |
| Chance | Any combination | Sum |
| Yatzy | All 5 same | 50 |


---
## 🛠 Implementation Notes

- **ES Module Architecture:**  
  `index.html` imports modular scripts under `js/`.  
  `DiceSet`, `YatzyEngine`, and `YatzyGame` handle dice, scoring, and game flow separately.

- **Accessibility:**  
  All dice and score buttons have `aria-label`s and visible focus states.

- **Responsive Layout:**  
  Adjusts automatically for mobile screens; controls stack vertically.

- **High Score Persistence:**  
  Stored in `localStorage` and displayed after each completed game.

- **Animations:**  
  Dice rolls use CSS transforms for realism; held dice are visually dimmed.

## ✅ Testing Checklist

- [x] Rolls limited to 3 per turn
- [x] “Hold” toggles dice correctly
- [x] Category can be scored only once
- [x] Bonus +35 applies when upper ≥ 63
- [x] Final score and High Score display correctly
- [x] Reset clears all data
- [x] Responsive on mobile screens
## 📁 File Structure


```text
yatzy/
├─ js/
│  ├─ dice.js          # Dice logic and hold/re-roll state
│  ├─ yatzyEngine.js   # Scoring logic and category evaluation
│  └─ yatzyGame.js     # Game state, turns, rolls, end of game
├─ index.html          # Main UI and module imports
├─ script.js           # UI controller connecting engine and DOM
├─ styles.css          # Design system, layout, responsive styles
├─ dice1.jpg           # Dice sprite sheet or image
├─ design_system.md    # Fonts, colors, component rationale
├─ README.md           # This documentation
└─ LICENSE

