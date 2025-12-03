class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');

        // ensure crisp rendering on high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = CANVAS_SIZE * dpr;
        this.canvas.height = CANVAS_SIZE * dpr;
        this.context.scale(dpr, dpr);
        
        this.canvas.style.width = CANVAS_SIZE + 'px';
        this.canvas.style.height = CANVAS_SIZE + 'px';

        // initialize game state
        this.score = 0;
        this.bestScore = 0; // will be loaded from API via gameStats
        this.grid = this.createEmptyGrid();
        
        // load best score from API
        this.loadBestScore();
        
        // timer variables
        this.timeLimit = 420; // 7 minutes in seconds
        this.timeRemaining = this.timeLimit;
        this.timerInterval = null;
        this.gameOver = false;
        this.gameWon = false;
        this.timerStarted = false; // track if timer has started
        this.winningTileValue = 512; // default, will be updated from API
        this.gameOverTimeout = null; // track pending game over alert
        this.winTimeout = null; // track pending win alert
        
        // initialize game stats tracking
        if (window.gameStats) {
            window.gameStats.startGame()
        }
        
        // Spawn two initial tiles
        this.spawnRandomTile();
        this.spawnRandomTile();
        this.draw();
        this.updateScore();
        this.updateTimerDisplay(); // show initial time without starting countdown
        this.setupInput();
    }

    // create a 4x4 grid filled with zeros
    createEmptyGrid() {
        const grid = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            grid[i] = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                grid[i][j] = 0;
            }
        }
        return grid;
    }

    spawnRandomTile() {
        // 1. Find all empty cells (value = 0)
        // 2. If no empty cells, return false (game over)
        // 3. Pick a random empty cell
        // 4. Assign value: 90% chance for 2, 10% chance for 4
        // 5. Return true
        const emptyCells = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }
        if (emptyCells.length > 0) {
            const { x, y } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[x][y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    // draw the entire game grid
    draw() {
        // Fill canvas background with grid color
        this.context.fillStyle = '#bbada0';
        this.context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        // Draw tiles
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                this.drawTile(i, j, this.grid[i][j]);
            }
        }
    }

    drawTile(row, col, value) {
        const x = Math.floor(col * (TILE_SIZE + TILE_GAP) + TILE_GAP);
        const y = Math.floor(row * (TILE_SIZE + TILE_GAP) + TILE_GAP);
        const radius = 6;
        
        // Draw rounded rectangle with fill
        this.context.fillStyle = COLORS[value] || '#cdc1b4';
        this.context.beginPath();
        this.context.roundRect(x, y, TILE_SIZE, TILE_SIZE, radius);
        this.context.fill();
        
        if (value !== 0) {
            const tileInfo = TILE_LABELS[value];
            if (tileInfo) {
                // draw emoji
                this.context.font = '40px Arial';
                this.context.textAlign = 'center';
                this.context.textBaseline = 'middle';
                this.context.fillText(tileInfo.emoji, x + TILE_SIZE / 2, y + TILE_SIZE / 2 - 8);
                
                // draw name text
                this.context.fillStyle = '#776e65';
                this.context.font = 'bold 11px Arial';
                this.context.fillText(tileInfo.name, x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 24);
            } else {
                // fallback to number if no label
                this.context.fillStyle = '#776e65';
                this.context.font = 'bold 40px Arial';
                this.context.textAlign = 'center';
                this.context.textBaseline = 'middle';
                this.context.fillText(value, x + TILE_SIZE / 2, y + TILE_SIZE / 2);
            }
        }
    }

    // handle move in given direction based on arrow key input
    handleMove(direction) {
        if (this.gameOver || this.gameWon) return; // prevent moves after game ends
        
        // start timer on first move
        if (!this.timerStarted) {
            this.startTimer();
            this.timerStarted = true;
        }
        
        let moved = false;
        const previousGrid = JSON.parse(JSON.stringify(this.grid));

        // perform move based on direction
        switch(direction) {
            case 'ArrowLeft':
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                break;
            case 'ArrowUp':
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                break;
        }

        // after tiles are moved, spawn new tile and redraw
        if (moved) {
            this.spawnRandomTile();
            this.updateScore(); // Update score display
            this.draw(); // redraw grid with updated tiles
            
            // track move in stats
            if (window.gameStats) {
                window.gameStats.recordMove()
            }
            
            // check win condition
            if (this.checkWin() && !this.gameWon) {
                this.gameWon = true;
                this.stopTimer();
                const winningTileName = TILE_LABELS[this.winningTileValue]?.name || `Tile ${this.winningTileValue}`;
                alert(`🎉 Congratulations! You reached the ${winningTileName}! 🥧\nTime: ` + this.formatTime(this.timeLimit - this.timeRemaining));
                // save win to backend
                if (window.gameStats) {
                    window.gameStats.saveGameResult(this.score, true)
                }
            }
            
            // check game over after spawning new tile
            // only check if game isn't already won
            if (!this.gameWon && !this.gameOver && this.checkGameOver()) {
                console.log('checkGameOver returned TRUE - Game is truly over');
                // Set flag IMMEDIATELY to block further input
                this.gameOver = true;
                this.stopTimer();
                
                // Use requestAnimationFrame to ensure the final draw is complete
                requestAnimationFrame(() => {
                    alert('Game Over! No more moves possible.');
                    // save loss to backend
                    if (window.gameStats) {
                        window.gameStats.saveGameResult(this.score, false)
                    }
                });
            }
        }
    }

    // move tiles left
    moveLeft() {
        let moved = false;

        // loop thru each row
        for (let i = 0; i < GRID_SIZE; i++) {
            const row = this.grid[i];
            const newRow = this.mergeLine(row); // merge the row

            // check if row changed
            // if arrow is clicked but row doesnt change (due to full row etc.), consider move still false
            if (JSON.stringify(row) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    // move tiles right
    moveRight() {
        let moved = false;
        // similar to moveLeft but reverse the row first
        for (let i = 0; i < GRID_SIZE; i++) {
            const row = this.grid[i];
            const reversedRow = row.slice().reverse();
            const newRow = this.mergeLine(reversedRow);
            const finalRow = newRow.reverse();
            if (JSON.stringify(row) !== JSON.stringify(finalRow)) {
                moved = true;
            }
            this.grid[i] = finalRow;
        }
        return moved;
    }

    // move tiles up
    moveUp() {
        let moved = false;

        // loop thru each column
        for (let j = 0; j < GRID_SIZE; j++) {
            const column = [];
            for (let i = 0; i < GRID_SIZE; i++) {
                column.push(this.grid[i][j]);
            }
            const newColumn = this.mergeLine(column);
            for (let i = 0; i < GRID_SIZE; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }

    // move tiles down
    moveDown() {
        let moved = false;
        for (let j = 0; j < GRID_SIZE; j++) {
            const column = [];
            for (let i = 0; i < GRID_SIZE; i++) {
                column.push(this.grid[i][j]);
            }
            const reversedColumn = column.slice().reverse();
            const newColumn = this.mergeLine(reversedColumn);
            const finalColumn = newColumn.reverse();
            for (let i = 0; i < GRID_SIZE; i++) {
                if (this.grid[i][j] !== finalColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = finalColumn[i];
            }
        }
        return moved;
    }

    // merge a line (row or column) of tiles if any
    mergeLine(line) {
        // remove zeros (slide tiles)
        let filtered = line.filter(val => val !== 0); // eg [2, 0, 2, 4] => [2, 2, 4]
        
        // merge adjacent equal values
        for (let i = 0; i < filtered.length - 1; i++) {
            if (filtered[i] === filtered[i + 1]) {
                filtered[i] *= 2; // double the value
                filtered[i + 1] = 0;
                this.score += filtered[i]; // add merged value to score
            }
        } // eg [2, 2, 4] => [4, 0, 4]
        
        // remove zeros again after merging (slide tiles)
        filtered = filtered.filter(val => val !== 0); // eg [4, 0, 4] => [4, 4]
        
        // fill with zeros to maintain grid size
        while (filtered.length < GRID_SIZE) {
            filtered.push(0);
        } // [4, 4] => [4, 4, 0, 0]
        
        return filtered;
    }

    // update score display
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
        
        // update best score if current score is higher
        // Note: best score will be saved to backend when game ends via gameStats
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
        }
        
        const bestScoreElement = document.getElementById('bestScore');
        if (bestScoreElement) {
            bestScoreElement.textContent = this.bestScore;
        }
        
        // track highest tile achieved
        if (window.gameStats) {
            const highestTile = Math.max(...this.grid.flat())
            window.gameStats.updateHighestTile(highestTile)
        }
    }

    // timer functions
    startTimer() {
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            if (this.timeRemaining > 0) {
                this.timeRemaining--;
                this.updateTimerDisplay();
                
                // time's up
                if (this.timeRemaining === 0) {
                    this.gameOver = true;
                    this.stopTimer();
                    setTimeout(() => {
                        const winningTileName = TILE_LABELS[this.winningTileValue]?.name || `Tile ${this.winningTileValue}`;
                        alert(`⏰ Time's Up! You didn't reach the ${winningTileName} in time.\nFinal Score: ` + this.score);
                        // save timeout to backend
                        if (window.gameStats) {
                            window.gameStats.saveGameResult(this.score, false)
                        }
                    }, 100);
                }
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = this.formatTime(this.timeRemaining);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    checkGameOver() {
        // First check if there are any empty cells
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.grid[i][j] === 0) {
                    return false; // empty cell found, game not over
                }
            }
        }
        
        // Then check if any adjacent tiles can merge
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const currentValue = this.grid[i][j];
                
                // check right neighbor
                if (j < GRID_SIZE - 1 && currentValue === this.grid[i][j + 1]) {
                    return false;
                }
                // check down neighbor
                if (i < GRID_SIZE - 1 && currentValue === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }
        
        return true; // no moves left, game over
    }

    checkWin() {
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.grid[i][j] === this.winningTileValue) {
                    return true; // player has won
                }
            }
        }
        return false;
    }

    // Load best score from API via gameStats
    async loadBestScore() {
        if (!window.gameStats || !isAuthenticated()) {
            this.bestScore = 0;
            this.updateScore();
            return;
        }
        
        try {
            const playerId = getPlayerId();
            if (playerId) {
                const player = await getPlayerById(playerId);
                this.bestScore = player.highestScore || 0;
                this.updateScore(); // update display
            }
        } catch (error) {
            console.error('Failed to load best score:', error);
            this.bestScore = 0;
        }
    }

    // Best score is automatically saved via gameStats.saveGameResult()
    // No need for separate save method

    resetGame() {
        this.stopTimer();
        this.score = 0;
        this.grid = this.createEmptyGrid();
        this.gameOver = false;
        this.gameWon = false;
        this.timerStarted = false;
        this.timeRemaining = this.timeLimit;
        this.spawnRandomTile();
        this.spawnRandomTile();
        this.updateScore();
        this.updateTimerDisplay();
        this.draw();
        
        // start new game session
        if (window.gameStats) {
            window.gameStats.startGame()
        }
    }


    setupInput() {
        // Store the handler so we can remove it later
        this.keydownHandler = (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.handleMove(e.key);
            }
        };
        
        // keyboard input for arrow keys
        document.addEventListener('keydown', this.keydownHandler);
        
        // Note: Reset button is handled globally in DOMContentLoaded
    }
    
    // Clean up event listeners
    cleanup() {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
}

// initialize game when DOM loads and user is authenticated
document.addEventListener('DOMContentLoaded', () => {
    // Setup New Game button handler (works regardless of game state)
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (window.game) {
                window.game.resetGame();
            } else if (isAuthenticated()) {
                // Create game if it doesn't exist
                const game = new Game('gameCanvas');
                window.game = game;
            }
        });
    }
    
    // Wait for auth check before initializing game
    setTimeout(() => {
        if (isAuthenticated() && !window.game) {
            const game = new Game('gameCanvas');
            window.game = game; // Make game accessible globally
        }
    }, 100);
});

// Listen for user change events to cleanup and reinitialize game
window.addEventListener('userChanged', () => {
    if (window.game) {
        if (window.game.cleanup) {
            window.game.cleanup();
        }
        window.game = null;
    }
    if (window.gameStats) {
        window.gameStats = null;
    }
    
    // Reinitialize game for new user
    setTimeout(() => {
        if (isAuthenticated() && !window.game) {
            const game = new Game('gameCanvas');
            window.game = game;
        }
    }, 100);
});

// Listen for logout events to cleanup game
window.addEventListener('userLogout', () => {
    if (window.game) {
        if (window.game.cleanup) {
            window.game.cleanup();
        }
        window.game = null;
    }
    if (window.gameStats) {
        window.gameStats = null;
    }
});

// Listen for game screen ready event to create game if needed
window.addEventListener('gameScreenReady', () => {
    if (!window.game && isAuthenticated()) {
        const game = new Game('gameCanvas');
        window.game = game;
    }
});