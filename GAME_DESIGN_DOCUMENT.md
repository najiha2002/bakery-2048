# Game Design Document: Bakery 2048

## 1. Game Overview

### 1.1 Title
**Bakery 2048**

### 1.2 Genre
Puzzle / Strategy / Casual

### 1.3 Target Platform
Web Browser (Desktop & Mobile)

### 1.4 Target Audience
- **Age Range:** 10+
- **Skill Level:** Casual to intermediate gamers
- **Demographics:** Players who enjoy puzzle games, merge mechanics, and light strategy

### 1.5 High Concept
A bakery-themed twist on the classic 2048 game where players combine ingredients to create delicious baked goods while racing against a 5-minute timer to reach the ultimate goal: the Whole Cake.

---

## 2. Game Mechanics

### 2.1 Core Gameplay Loop
1. **Move tiles** using arrow keys (↑ ↓ ← →)
2. **Tiles slide** in the pressed direction until they hit an edge or another tile
3. **Identical tiles merge** when they collide, creating the next ingredient level
4. **New tile spawns** after each valid move
5. **Score increases** when tiles merge
6. **Timer counts down** from 5 minutes
7. **Win or lose** based on conditions

### 2.2 Player Controls
| Input | Action |
|-------|--------|
| Arrow Up (↑) | Move tiles upward |
| Arrow Down (↓) | Move tiles downward |
| Arrow Left (←) | Move tiles left |
| Arrow Right (→) | Move tiles right |
| Click "New Game" | Reset game |

### 2.3 Grid System
- **Grid Size:** 4x4 (16 cells)
- **Tile Spawn:** Random empty cell receives either:
  - Flour (90% probability)
  - Egg (10% probability)
- **Movement:** All tiles slide simultaneously in the chosen direction

### 2.4 Merge Rules
- Two tiles with **identical values** merge into one tile with **double the value**
- Merged tile appears at the **destination position**
- Only **one merge per tile per move**
- Example: `[2] + [2] → [4]`

---

## 3. Game Progression

### 3.1 Ingredient Hierarchy
Players progress through 12 ingredient levels:

| Level | Value | Ingredient | Emoji |
|-------|-------|------------|-------|
| 1 | 2 | Flour | 🌾 |
| 2 | 4 | Egg | 🥚 |
| 3 | 8 | Butter | 🧈 |
| 4 | 16 | Sugar | 🍬 |
| 5 | 32 | Donut | 🍩 |
| 6 | 64 | Cookie | 🍪 |
| 7 | 128 | Cupcake | 🧁 |
| 8 | 256 | Slice Cake | 🍰 |
| 9 | 512 | Whole Cake | 🎂 |

### 3.2 Scoring System
- **Points earned:** Equal to the value of the merged tile
- **Example:** Merging two Butters (8+8) = 16 points for Sugar
- **Best Score:** Highest score achieved is saved in localStorage (browser storage)

---

## 4. Challenge System

### 4.1 Timer Challenge
- **Duration:** 5 minutes (300 seconds)
- **Start Trigger:** First move/arrow key press
- **Display:** MM:SS format (e.g., 5:00, 4:59)
- **Visual:** Red/pink themed timer box for urgency
- **Purpose:** Adds time pressure and replayability

### 4.2 Win Conditions
✅ **Victory:** Create the Whole Cake tile (512) before time runs out
- Shows completion time
- Displays final score
- Updates best score if beaten

### 4.3 Lose Conditions
❌ **Game Over scenarios:**
1. **Time's Up:** 5 minutes expire before reaching Whole Cake
2. **No Moves:** Grid is full with no adjacent matching tiles

---


## 5. Technical Specifications

### 5.1 Technologies Used
- **HTML5:** Structure and canvas element
- **CSS3:** Styling and responsive layout
- **JavaScript (ES6):** Game logic and rendering
- **Canvas API:** 2D tile rendering
- **localStorage:** Best score persistence

### 5.2 File Structure
```
bakery-2048/
├── index.html              # Main HTML file
├── package.json            # NPM dependencies and test scripts
├── README.md              # Project documentation
├── GAME_DESIGN_DOCUMENT.md # This document
├── src/
│   ├── style.css          # Game styling
│   ├── js/
│   │   ├── constants.js   # Game constants & tile definitions
│   │   └── script.js      # Core game logic (Game class)
│   └── tests/
│       └── game.test.js   # Jest unit tests
```

### 5.3 Key Classes & Functions

**Game Class:**
- `constructor()` - Initialize game state
- `createEmptyGrid()` - Create 4x4 zero-filled array
- `spawnRandomTile()` - Add random tile to empty cell
- `draw()` - Render grid to canvas
- `handleMove(direction)` - Process arrow key input
- `moveLeft/Right/Up/Down()` - Directional movement logic
- `mergeLine(line)` - Slide and merge algorithm
- `checkWin()` - Detect 2048 tile
- `checkGameOver()` - Detect no valid moves
- `startTimer()` - Begin countdown
- `updateTimerDisplay()` - Update timer UI
- `resetGame()` - Reset to initial state

### 5.4 Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- Canvas 2D context support
- localStorage support

---

## 6. Audio & Visual Effects

### 6.1 Current Implementation
- ✅ Emoji-based tile graphics
- ✅ Rounded tile corners
- ✅ Color-coded progression
- ✅ Pixel-perfect rendering (DPI scaling)

### 6.2 Future Enhancements
- 🔄 Tile slide animations
- 🔄 Merge pop effects
- 🔄 Sound effects (whoosh, merge, win)
- 🔄 Background music toggle
- 🔄 Particle effects on merges
- 🔄 Victory/game over modal overlays

---

## 7. Game Flow

### 7.1 Game States
```
[START] → [PLAYING] → [WON] / [LOST]
                    ↓
              [NEW GAME]
```

### 7.2 State Transitions

**START:**
- Initialize 4x4 grid
- Spawn 2 random tiles
- Display 5:00 timer (paused)
- Score = 0

**PLAYING:**
- Timer starts on first move
- Player makes moves
- Tiles slide and merge
- Score updates
- New tiles spawn
- Check win/lose conditions

**WON:**
- 2048 tile created
- Timer stops
- Show completion time
- Display final score
- Prompt for new game

**LOST (No Moves):**
- Grid full, no adjacent matches
- Timer stops
- Show final score
- Prompt for new game

**LOST (Time Up):**
- Timer reaches 0:00
- Game locks
- Show final score
- Prompt for new game

**NEW GAME:**
- Reset all states
- Return to START

---

## 8. Player Interaction & Feedback

### 8.1 Visual Feedback
- **Tile appearance:** Smooth rendering with emojis
- **Score increase:** Numerical update on merge
- **Timer countdown:** Live second-by-second update
- **Full grid:** Visible when approaching game over

### 8.2 Alert Messages
- **Win:** "🎉 Congratulations! You reached the Whole Cake! Time: [elapsed time]"
- **Game Over (No Moves):** "Game Over! No more moves possible."
- **Game Over (Time Up):** "⏰ Time's Up! You didn't reach the Pie in time. Final Score: [score]"

### 8.3 Help System
- **Help Icon (?):** Fixed position top-right
- **Tooltip on Hover:** Shows all 12 ingredient levels
- **Always Accessible:** Available during gameplay

---

## 9. Data Persistence

### 9.1 localStorage Usage
- **Key:** `bakery2048-bestScore`
- **Value:** Integer (highest score achieved)
- **Scope:** Per browser/device
- **Lifespan:** Until browser cache cleared

### 9.2 Saved Data
- Best Score (saved)
- Current game state (not saved)
- Statistics (not tracked yet)

---

## 10. Accessibility & Usability

### 10.1 Keyboard Navigation
- Full game playable with arrow keys only
- No mouse required for gameplay

### 10.2 Visual Clarity
- High contrast text and backgrounds
- Large emoji for easy recognition
- Color progression for tile values
- Rounded corners for modern aesthetic

### 10.3 Responsive Design
- Centered layout
- Fixed canvas size (400x400px)
- Scalable UI elements

---

## 11. Future Features & Improvements

### 11.1 Planned Enhancements
- [ ] Smooth tile slide animations
- [ ] Modal dialogs (replace alerts)
- [ ] Sound effects and music
- [ ] Mobile touch/swipe support
- [ ] Undo move (limited uses)
- [ ] Achievements system
- [ ] Global leaderboard (Firebase)
- [ ] Daily challenges
- [ ] Different grid sizes (3x3, 5x5)
- [ ] Dark mode theme
- [ ] Share score to social media

### 11.2 Difficulty Modes
- **Easy:** 7 minutes, unlimited
- **Normal:** 5 minutes (current)
- **Hard:** 3 minutes, faster spawn rate
- **Zen:** No timer, endless mode

### 11.3 Power-ups (Potential)
- **Shuffle:** Rearrange all tiles
- **Remove:** Delete one tile
- **Undo:** Revert last move
- **Time Freeze:** Pause timer for 30 seconds

---

## 12. Development Timeline

### 12.1 Completed Milestones
- Core game mechanics (grid, movement, merging)
- Bakery theme with emoji graphics
- Score tracking system
- Best score persistence
- Timer challenge (5 minutes)
- Win/lose conditions
- Help tooltip system
- Responsive UI design

### 12.2 In Progress
- Tile animations
- Code optimization
- Bug fixes

### 12.3 Backlog
- Sound effects
- Mobile optimization
- Leaderboard system
- Achievement badges

---

## 13. Testing & Quality Assurance

### 13.1 Test Cases
**Completed Tests:**
- Tile movement in all 4 directions
- Tile merging logic
- Score calculation
- Timer countdown
- Win condition (2048 tile)
- Lose condition (no moves)
- Lose condition (time up)
- Reset functionality
- Best score persistence
- Help tooltip display

### 13.2 Known Issues
- Canvas animation flicker (animations disabled)
- Alert dialogs (should be modals)

---

## 14. Credits & Acknowledgments

### 14.1 Development
**Developer:** Najiha  
**GitHub:** @najiha2002  
**Project Repository:** github.com/najiha2002/bakery-2048

### 14.2 Inspiration
This game is inspired by the original 2048 game created by Gabriele Cirulli, which itself was based on the game 1024 by Veewo Studio and conceptually similar to Threes by Asher Vollmer. The bakery theme adds a unique twist to the classic sliding puzzle mechanics.

### 14.3 Assets
**Graphics:** Unicode emoji standard for cross-platform consistency  
**Fonts:** System default fonts for optimal performance and compatibility  
**No external libraries:** Built with vanilla JavaScript for educational purposes

---

## Appendix A: Game Rules Summary

**Objective:** Merge bakery ingredients to create the Pie (2048) within 5 minutes.

**How to Play:**
1. Use arrow keys to slide tiles
2. Tiles with the same ingredient merge
3. Each merge creates the next ingredient level
4. Timer starts on your first move
5. Reach the Pie before time runs out!

**Tips:**
- Keep your highest value tiles in a corner
- Plan ahead to avoid filling the grid
- Work systematically in one direction
- Use the help icon to review ingredients

---

## Appendix B: Color Reference

```javascript
COLORS = {
    0: '#cdc1b4',      // Empty tile
    2: '#fcefe6',      // Flour
    4: '#f2e8cb',      // Egg
    8: '#f5b682',      // Butter
    16: '#f29446',     // Sugar
    32: '#ff775c',     // Donut
    64: '#e64c2e',     // Cookie
    128: '#ede291',    // Cupcake
    256: '#fce130',    // Slice Cake
    512: '#ffdb4a',    // Whole Cake
}
```

---

**Document Version:** 1.0  
**Last Updated:** November 17, 2025  
**Status:** Active Development
