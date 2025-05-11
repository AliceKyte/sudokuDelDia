/**
 * Sudoku Generator with Seeded Randomness
 * This module creates valid sudoku puzzles based on a random seed.
 */

/**
 * A simple seeded random number generator
 * @param {number} seed - The random seed
 * @returns {function} A function that returns a random number between 0 and 1
 */
function createRandomGenerator(seed) {
	// Initial seed
	let _seed = seed % 2147483647;
	if (_seed <= 0) _seed += 2147483646;

	return function() {
		// This is a "Linear Congruential Generator"
		_seed = (_seed * 16807) % 2147483647;
		return (_seed - 1) / 2147483646;
	};
}

/**
 * Creates a new sudoku puzzle with the given seed
 * @param {number|string} seed - Random seed for generation
 * @param {number} difficulty - Number of cells to remove (difficulty level)
 * @returns {Object} An object containing the full solution and the puzzle
 */
function generateSudoku(seed, difficulty = 40) {
	const random = createRandomGenerator(seed);

	// Initialize empty 9x9 grid
	const grid = Array(9).fill().map(() => Array(9).fill(0));

	// Fill diagonal 3x3 boxes first (these can be filled independently)
	fillDiagonalBoxes(grid, random);

	// Fill the rest of the grid using backtracking
	solveGrid(grid, random);

	// Make a copy of the solution
	const solution = grid.map(row => [...row]);

	// Remove numbers according to difficulty
	removeNumbers(grid, difficulty, random);

	return {
		solution: solution,
		puzzle: grid
	};
}

/**
 * Fill the 3 diagonal 3x3 boxes of the grid
 * @param {number[][]} grid - The grid to fill
 * @param {function} random - Seeded random function
 */
function fillDiagonalBoxes(grid, random) {
	for (let box = 0; box < 3; box++) {
		const values = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		// Shuffle values
		shuffleArray(values, random);

		let index = 0;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				const row = (box * 3) + i;
				const col = (box * 3) + j;
				grid[row][col] = values[index++];
			}
		}
	}
}

/**
 * Shuffle an array in-place using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @param {function} random - Seeded random function
 */
function shuffleArray(array, random) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

/**
 * Solve the grid using backtracking algorithm
 * @param {number[][]} grid - The grid to solve
 * @param {function} random - Seeded random function
 * @returns {boolean} Whether the grid was solved successfully
 */
function solveGrid(grid, random) {
	const emptyCell = findEmptyCell(grid);
	if (!emptyCell) return true; // Grid is filled

	const [row, col] = emptyCell;
	const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	shuffleArray(numbers, random);

	for (const num of numbers) {
		if (isSafe(grid, row, col, num)) {
			grid[row][col] = num;

			if (solveGrid(grid, random)) {
				return true;
			}

			// Backtrack if this leads to an invalid solution
			grid[row][col] = 0;
		}
	}

	return false;
}

/**
 * Find an empty cell in the grid
 * @param {number[][]} grid - The grid to search
 * @returns {[number, number]|null} Row and column of empty cell, or null if none
 */
function findEmptyCell(grid) {
	for (let row = 0; row < 9; row++) {
		for (let col = 0; col < 9; col++) {
			if (grid[row][col] === 0) {
				return [row, col];
			}
		}
	}
	return null;
}

/**
 * Check if it's safe to place a number at the given position
 * @param {number[][]} grid - The grid
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} num - Number to check
 * @returns {boolean} Whether the number can be placed safely
 */
function isSafe(grid, row, col, num) {
	// Check row
	for (let x = 0; x < 9; x++) {
		if (grid[row][x] === num) return false;
	}

	// Check column
	for (let x = 0; x < 9; x++) {
		if (grid[x][col] === num) return false;
	}

	// Check 3x3 box
	const boxStartRow = Math.floor(row / 3) * 3;
	const boxStartCol = Math.floor(col / 3) * 3;

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (grid[boxStartRow + i][boxStartCol + j] === num) return false;
		}
	}

	return true;
}

/**
 * Remove numbers from the grid based on difficulty
 * @param {number[][]} grid - The grid to modify
 * @param {number} difficulty - Number of cells to remove
 * @param {function} random - Seeded random function
 */
function removeNumbers(grid, difficulty, random) {
	// Create array of all positions
	const positions = [];
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			positions.push([i, j]);
		}
	}

	// Shuffle positions
	shuffleArray(positions, random);

	// Calculate how many cells to keep (81 - difficulty)
	const cellsToRemove = Math.min(difficulty, 65); // Cap at 65 to ensure unique solution

	// Remove numbers
	for (let i = 0; i < cellsToRemove; i++) {
		const [row, col] = positions[i];
		grid[row][col] = 0;
	}
}

// const result = generateSudoku(seed, 30);
