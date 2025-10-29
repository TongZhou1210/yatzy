# 🎲 Yatzy Game – Lab05

## 📌 Overview
This is a **single-player version** of Yatzy designed as a self-challenge game to achieve the highest possible score.  
Players roll five dice and fill in categories on the scorecard. The game is based on both luck and strategy, requiring the player to decide wisely which category to score after each roll.

---

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

## 🛠️ Implementation Notes for Lab05
- This project focuses on **building mockups** of the game interface.
- Deliverables include:
    - A **design system** (colors, fonts, rationale).
    - A **dice design** (size, shape, color, pips).
    - A **mockup interface** showing the dice, scoreboard, and controls.
    - Screenshots to demonstrate the mockups.

---

## 📁 File Structure

```text
lab05/
├─ README.md              ← Game rules (this file)
├─ design_system.md       ← Colors + Fonts + Explanation
├─ dice1.png              ← Dice design draft
├─ mockups/               ← Game interface mockups
│   ├─ index.html
│   ├─ styles.css
│   ├─ mockup1.png
│   └─ mockup2.png