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

        this.grid = this.createEmptyGrid();
        // Spawn two initial tiles
        this.spawnRandomTile();
        this.spawnRandomTile();
        this.draw();
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

    setupInput() {
        //placeholder for input setup
        console.log('to be implemented');
    }
}

// initialize game when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');
});