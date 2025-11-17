# 🎲 Yatzy – Single-Player Game
CST3106 Assignment 2

A full-stack, server-backed single-player implementation of Yatzy (Yahtzee) using Node.js, Express, and modular JavaScript.
This assignment extends the browser-only version from Assignment 1 into a complete client–server web application.
The browser handles UI rendering while all game logic, dice rolls, scoring, and state management now run on the server through a REST API.
---

## 🚀 How to Run
1. Start the backend server：
   cd assignment2
   npm install
   npm start
   Server runs at:
   👉 http://localhost:3000

2. Open the front-end 
Go to:👉 http://localhost:3000/index.html ，This loads the original Assignment 1 UI, but all actions now communicate with the server.

## 📖 How the Full-Stack Version Works

1. **Client (Browser UI)**
	- Renders dice, holds, score table, totals
    - Sends requests to the server using fetch()
	- Updates the UI based on JSON responses
	- Stores high score locally using localStorage
	- Contains no game logic (no scoring, no dice math)
2. **Server (Node.js + Express)**
	- Tracks dice values and which dice are held
	- Calculates scoring for all 13 categories
	- Tracks rolls left per turn
	- Manages rounds and detects end of game
	- Returns full game state after every action
	- Reuses Assignment 1 logic (dice.js, yatzyEngine.js, yatzyGame.js)
3. **REST API Communication**
    - Every roll, hold toggle, and score selection triggers a call to the server
    - Server responds with updated state, and the browser re-renders the UI

---

## 🎮 Game Features
- **Roll five dice up to three times each turn**  
- **Choose which dice to hold/release**  
- **Score once per category across 13 rounds**  
- **Automatic bonus when upper section ≥ 63** 
- **Server-side validation prevents invalid scoring** 
- **High Score stored locally in the browser**


- All gameplay rules remain identical t Assignment 1 — the difference is where the logic runs (server instead of browser).
---

## 📡 REST API Endpoints
| Method | Endpoint         | Description                          |
|--------|------------------|--------------------------------------|
| POST   | /api/game/new    | Start a brand new game               |
| GET    | /api/game/state  | Get the current game state           |
| POST   | /api/game/end    | End the game immediately             |
| POST   | /api/dice/roll   | Roll all non-held dice               |
| POST   | /api/dice/hold   | Toggle or set hold state for one die |
| POST   | /api/score       | Score a category and advance the round |

- Each response returns a full JSON structure of the current game.
---

## 🛠 Implementation Notes

- **Front-End Controller (script.js)**  
  - Sends actions (roll, hold, score, reset) to the server
  - Updates UI with game state JSON
  - No longer performs any calculations

- **Back-End Logic**  
  - Express routes handle game actions
  - Controllers call functions on the server-side YatzyGame
  - gameState.js stores one global game instance
  -	Game logic reused from Assignment 1
  
- **Architecture (MVC-inspired)**  
  - Routes → define endpoint paths
  -	Controllers → contain action logic
  -	Model (YatzyGame) → performs all dice/score calculations
  
- **Static Front-End**  
  -	Served directly from project root
  -	No changes needed in Assignment 1 UI files
---
## 🧪 Testing Checklist
- [x] Server successfully starts on port 3000
- [x] Opening /index.html loads the UI
- [x] Dice roll when clicking Roll
- [x] Hold/unhold works and syncs with server
- [x] Score appears in table after category click
- [x] Cannot score the same category twice
- [x] rollsLeft decreases properly
- [x] Automatic bonus when upper ≥ 63
- [x] Game ends after all 13 categories
- [x] High score updated in localStorage
---
## 📚 What I Learned in This Assignment
This assignment helped me understand:
- How to convert a front-end–only application into a full client–server architecture.
- How to build REST API endpoints using Node.js and Express.
- How to maintain game logic and state on the server instead of the browser.
- How to separate concerns using a lightweight MVC pattern (Routes → Controllers → Game Logic).
- How the front-end can interact with a backend through JSON-based HTTP requests.
- How full-stack apps in the real world manage sessions, state, and logic.
---
## 📁 File Structure

```text
yatzy/
│
├─ index.html               # Front-end UI (unchanged from Assignment 1)
├─ script.js                # Updated: client-side controller using fetch()
├─ styles.css
├─ dice1.jpg
│
├─ js/                      # Reused game logic from Assignment 1
│  ├─ dice.js
│  ├─ yatzyEngine.js
│  └─ yatzyGame.js
│
└─ assignment2/
   ├─ server.js             # Express server entry point
   ├─ gameState.js          # Stores and serializes the YatzyGame instance
   ├─ package.json
   │
   ├─ controllers/
   │   ├─ diceController.js     # Roll dice, hold dice
   │   └─ scoreController.js    # Score categories
   │
   └─ routes/
       ├─ diceRoutes.js         # /api/dice/...
       └─ scoreRoutes.js        # /api/score
