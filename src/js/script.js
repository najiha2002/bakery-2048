class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');

        // ensure crisp rendering on high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.context.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // initialize game state
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.grid = this.createEmptyGrid();
        
        // Spawn two initial tiles
        this.spawnRandomTile();
        this.spawnRandomTile();
        this.draw();
        this.updateScore();
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
        this.context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                this.drawTile(i, j, this.grid[i][j]);
            }
        }
    }

    drawTile(row, col, value) {
        const x = Math.floor(col * (TILE_SIZE + TILE_GAP) + TILE_GAP);
        const y = Math.floor(row * (TILE_SIZE + TILE_GAP) + TILE_GAP);
        this.context.fillStyle = COLORS[value] || '#cdc1b4';
        this.context.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        if (value !== 0) {
            this.context.fillStyle = '#776e65';
            this.context.font = 'bold 40px Arial';
            this.context.textAlign = 'center';
            this.context.textBaseline = 'middle';
            this.context.fillText(value, x + TILE_SIZE / 2, y + TILE_SIZE / 2);
        }
    }

    // handle move in given direction based on arrow key input
    handleMove(direction) {
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
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
        }
        
        const bestScoreElement = document.getElementById('bestScore');
        if (bestScoreElement) {
            bestScoreElement.textContent = this.bestScore;
        }
    }

    // Load best score from localStorage
    loadBestScore() {
        const saved = localStorage.getItem('bakery2048-bestScore');
        return saved ? parseInt(saved) : 0;
    }

    // Save best score to localStorage
    saveBestScore() {
        localStorage.setItem('bakery2048-bestScore', this.bestScore.toString());
    }


    setupInput() {
        // keyboard input for arrow keys
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
                this.handleMove(e.key);
            }
        });
    }
}

// initialize game when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');
});