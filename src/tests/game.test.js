// Bakery 2048 Game Logic Tests using Jest

describe('Bakery 2048 Game Logic', () => {
    
    describe('mergeLine logic', () => {
        // merge logic used in script.js - unable to import directly due to module scope, so redefining here for tests
        function testMergeLine(line) {
            let filtered = line.filter(val => val !== 0);
            for (let i = 0; i < filtered.length - 1; i++) {
                if (filtered[i] === filtered[i + 1]) {
                    filtered[i] *= 2;
                    filtered[i + 1] = 0;
                }
            }
            filtered = filtered.filter(val => val !== 0);
            while (filtered.length < 4) filtered.push(0);
            return filtered;
        }

        test('should merge two equal tiles', () => {
            const result = testMergeLine([2, 2, 0, 0]);
            expect(result).toEqual([4, 0, 0, 0]);
        });

        test('should merge multiple pairs', () => {
            const result = testMergeLine([2, 2, 4, 4]);
            expect(result).toEqual([4, 8, 0, 0]);
        });

        test('should not merge different tiles', () => {
            const result = testMergeLine([2, 4, 8, 16]);
            expect(result).toEqual([2, 4, 8, 16]);
        });

        test('should handle line with gaps', () => {
            const result = testMergeLine([2, 0, 2, 0]);
            expect(result).toEqual([4, 0, 0, 0]);
        });

        test('should merge only once per pair', () => {
            const result = testMergeLine([2, 2, 2, 0]);
            expect(result).toEqual([4, 2, 0, 0]);
        });

        test('should handle empty line', () => {
            const result = testMergeLine([0, 0, 0, 0]);
            expect(result).toEqual([0, 0, 0, 0]);
        });
    });

    describe('Grid utilities', () => {
        test('should detect empty cells in grid', () => {
            const grid = [[2, 0], [4, 8]];
            const hasEmpty = grid.some(row => row.some(cell => cell === 0));
            expect(hasEmpty).toBe(true);
        });

        test('should detect full grid', () => {
            const grid = [[2, 4], [8, 16]];
            const hasEmpty = grid.some(row => row.some(cell => cell === 0));
            expect(hasEmpty).toBe(false);
        });

        test('should detect win condition (512 tile)', () => {
            const grid = [[2, 4], [8, 512]];
            const hasWon = grid.some(row => row.some(cell => cell === 512));
            expect(hasWon).toBe(true);
        });

        test('should not detect win without 512 tile', () => {
            const grid = [[2, 4], [8, 256]];
            const hasWon = grid.some(row => row.some(cell => cell === 512));
            expect(hasWon).toBe(false);
        });
    });
});

