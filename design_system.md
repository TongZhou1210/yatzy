# 🎨 Design System – Yatzy (Single-Player)

## 1) Layout
- **Two-pane layout (desktop):** Left side shows dice and controls, right side shows the complete scoreboard (including **High Score**).
- **Mobile responsive:** On smaller screens, layout switches to vertical (dice + controls on top, scoreboard below).
- **Single-player emphasis:** Scoreboard header always displays **🏆 High Score** (stored in browser `localStorage`).

## 2) Color Palette
- **Primary – Green**  
  `#2E7D32` (Dark Green): Main buttons, header, and highlights.
- **Success – Bright Green**  
  `#388E3C`: Hover states, confirmations.
- **Accent – Yellow**  
  `#FBC02D`: Highlighted scores (High Score).
- **Danger – Red**  
  `#D32F2F`: "End Game" button.
- **Surface / Text**  
  Background `#F5F5F5`, Main text `#1F2937`, Secondary text `#6B7280`, Cards `#FFFFFF`, Borders `#E5E7EB`.

## 3) Typography
- **Headings:** Bold, modern system font. Used for game title and panel titles.
- **Body:** Regular weight system font. Used for table rows, instructions, button labels.

## 4) Dice & UI Elements
- **Dice:** White background with black dots. Uses a 6-frame horizontal sprite (`dice1.jpg`).
- **Buttons:**
    - `Roll Dice`: Green background.
    - `End Game`: Red background.
    - `Reset`: White background with colored border.
- **Scoreboard:** Always visible on the right, with bold totals. High Score highlighted in yellow.

## 5) Interaction
- `Roll Dice`: Starts a simple animation, then stops with random dice faces.
- `End Game`: Sums up the 5 dice as the round’s score (mock version). Updates the scoreboard and checks against **High Score** in `localStorage`.
- `Reset`: Resets dice and clears the current score (but not the High Score).

