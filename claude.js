/**
 * Sudoku Generator with Seeded Randomness
 * This module creates valid sudoku puzzles based on a random seed.
 */

/**
 * Generate random seed daily
 */
const today = new Date();
const seed = `${today.getFullYear()}${today.getMonth() + 1}${today.getDate()}`;

// random number generator seeded
const random = createRandomGenerator(seed);

/**
 * A simple seeded random number generator
 * @param {number|string} seed - The random seed
 * @returns {function} A function that returns a random number between 0 and 1
 */
function createRandomGenerator(seed) {
	// Convert string seed to a number if needed
	if (typeof seed === 'string') {
		let hashCode = 0;
		for (let i = 0; i < seed.length; i++) {
			hashCode = ((hashCode << 5) - hashCode) + seed.charCodeAt(i);
			hashCode = hashCode & hashCode; // Convert to 32bit integer
		}
		seed = Math.abs(hashCode);
	}

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
 * @param {number} numClues - Target number of clues to keep (17-30 recommended)
 */
export function generateSudoku(numClues = 17) {
	// Minimum valid clues is 17 (mathematically proven)
	numClues = Math.max(numClues, 17);

	// Initialize empty 9x9 grid
	const grid = Array(9).fill().map(() => Array(9).fill(0));

	// Fill diagonal 3x3 boxes first (these can be filled independently)
	fillDiagonalBoxes(grid, random);

	// Fill the rest of the grid using backtracking
	solveGrid(grid, random);

	// Make a copy of the solution
	const solution = grid.map(row => [...row]);

	// Remove numbers to create the puzzle
	const remainingClues = removeNumbers(grid, numClues, random);

	return {
		solution: solution,
		puzzle: grid,
		clues: remainingClues,
		uniqueSolution: true
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
 * Remove numbers from the grid while ensuring a unique solution and targeting a specific number of clues
 * @param {number[][]} grid - The grid to modify
 * @param {number} targetClues - Target number of clues to keep (typically 17-30)
 * @param {function} random - Seeded random function
 * @returns {number} - Actual number of clues remaining in the puzzle
 */
function removeNumbers(grid, targetClues, random) {
	// Make a deep copy of the original filled grid
	const fullSolution = grid.map(row => [...row]);

	// Phase 1: Initial aggressive removal - remove numbers in pairs
	// This leverages the property that symmetric removals often preserve uniqueness
	const n = 9;
	// Initialize with all cells filled
	let remainingCells = n * n;

	// Keep removing until we have only target+10 clues (buffer for fine-tuning)
	const initialTarget = Math.max(targetClues + 10, 30);

	// Anti-infinite loop protection
	let attemptLimit = 500; // Maximum number of pair removal attempts
	let attempts = 0;
	let successfulRemovals = true; // Flag to track if we're making progress

	while (remainingCells > initialTarget && attempts < attemptLimit && successfulRemovals) {
		attempts++;
		successfulRemovals = false; // Reset flag - will be set to true if we remove any pair

		// Try multiple positions in each iteration to increase chances of finding removable pairs
		for (let i = 0; i < 5; i++) {
			// Pick a random cell
			const row = Math.floor(random() * n);
			const col = Math.floor(random() * n);

			// Skip if already empty
			if (grid[row][col] === 0) continue;

			// Find symmetric position (rotational symmetry)
			const symRow = n - 1 - row;
			const symCol = n - 1 - col;

			// Skip if symmetric cell is already empty
			if (grid[symRow][symCol] === 0) continue;

			// Try removing the pair
			const val1 = grid[row][col];
			const val2 = grid[symRow][symCol];

			grid[row][col] = 0;
			grid[symRow][symCol] = 0;

			// Check if still has unique solution
			const testGrid = grid.map(row => [...row]);
			if (!hasUniqueSolution(testGrid)) {
				// If not unique, restore values
				grid[row][col] = val1;
				grid[symRow][symCol] = val2;
			} else {
				// Successfully removed two cells
				remainingCells -= 2;
				successfulRemovals = true;
				break; // Found a removable pair, exit inner loop
			}
		}
	}

	// If we hit attempt limit without reaching target, log information
	if (attempts >= attemptLimit) {
		console.log(`Phase 1 reached attempt limit with ${remainingCells} clues remaining`);
	}

	// Phase 2: Targeted removal based on constraint analysis
	// Get all non-empty cells
	const candidates = [];
	for (let i = 0; i < 9; i++) {
		for (let j = 0; j < 9; j++) {
			if (grid[i][j] !== 0) {
				candidates.push([i, j]);
			}
		}
	}

	// Sort by "constraint power" - cells with more filled neighbors are more constrained
	// and thus potentially more removable
	candidates.sort((a, b) => {
		const [aRow, aCol] = a;
		const [bRow, bCol] = b;
		const aScore = getConstraintScore(grid, aRow, aCol);
		const bScore = getConstraintScore(grid, bRow, bCol);

		// Sort by constraint score (higher first)
		return bScore - aScore;
	});

	// Try removing cells one by one until we hit target
	let index = 0;
	let phase2Attempts = 0;
	const phase2Limit = candidates.length * 2; // Generous limit

	while (remainingCells > targetClues && index < candidates.length && phase2Attempts < phase2Limit) {
		phase2Attempts++;
		const [row, col] = candidates[index++];

		// Skip if already empty (might have been removed in a previous iteration)
		if (grid[row][col] === 0) continue;

		// Try removing this cell
		const val = grid[row][col];
		grid[row][col] = 0;

		// Check if still has unique solution
		const testGrid = grid.map(row => [...row]);
		if (!hasUniqueSolution(testGrid)) {
			// If not unique, restore value
			grid[row][col] = val;
		} else {
			// Successfully removed a cell
			remainingCells--;
		}

		// If we've tried all candidates but haven't reached target, reshuffle with new scores
		if (index >= candidates.length && remainingCells > targetClues) {
			// Recalculate scores and resort remaining candidates
			const newCandidates = [];
			for (let i = 0; i < 9; i++) {
				for (let j = 0; j < 9; j++) {
					if (grid[i][j] !== 0) {
						newCandidates.push([i, j]);
					}
				}
			}

			candidates.length = 0; // Clear array
			candidates.push(...newCandidates); // Add new candidates

			// Resort with updated constraint scores
			candidates.sort((a, b) => {
				const [aRow, aCol] = a;
				const [bRow, bCol] = b;
				const aScore = getConstraintScore(grid, aRow, aCol, random());
				const bScore = getConstraintScore(grid, bRow, bCol, random());

				// Add some randomness to break ties and explore different paths
				return bScore - aScore;
			});

			index = 0; // Reset index to try again with new sorting
		}
	}

	// Return the actual number of clues remaining
	return remainingCells;
}

/**
 * Calculate a constraint score for a cell based on filled neighbors
 * @param {number[][]} grid - The puzzle grid
 * @param {number} row - Row index
 * @param {number} col - Column index
 * @param {number} randomFactor - Optional random factor for tie-breaking (0-1)
 * @returns {number} A score representing how constrained this cell is
 */
function getConstraintScore(grid, row, col, randomFactor = 0) {
	// Higher scores mean more constraints (more removable)
	let score = 0;

	// Check row constraints
	for (let c = 0; c < 9; c++) {
		if (c !== col && grid[row][c] !== 0) {
			score++;
		}
	}

	// Check column constraints
	for (let r = 0; r < 9; r++) {
		if (r !== row && grid[r][col] !== 0) {
			score++;
		}
	}

	// Check 3x3 box constraints
	const boxStartRow = Math.floor(row / 3) * 3;
	const boxStartCol = Math.floor(col / 3) * 3;

	for (let r = 0; r < 3; r++) {
		for (let c = 0; c < 3; c++) {
			const rr = boxStartRow + r;
			const cc = boxStartCol + c;
			if ((rr !== row || cc !== col) && grid[rr][cc] !== 0) {
				score++;
			}
		}
	}

	// Value awareness - some numbers have more positioning constraints
	// This is a heuristic based on Sudoku theory
	const difficulties = {
		1: 0.5, 2: 0.7, 3: 1.0, 4: 1.2, 5: 1.5,
		6: 1.2, 7: 1.0, 8: 0.7, 9: 0.5
	};

	score *= difficulties[grid[row][col]] || 1;

	// Penalty for corner and edge positions (they constrain less)
	if ((row === 0 || row === 8) && (col === 0 || col === 8)) {
		score *= 0.8; // Corner penalty
	} else if (row === 0 || row === 8 || col === 0 || col === 8) {
		score *= 0.9; // Edge penalty
	}

	// Add a small random factor for tie-breaking (when provided)
	if (randomFactor > 0) {
		score += randomFactor * 0.1; // Small random adjustment (max 10% of a point)
	}

	return score;
}

/**
 * Check if the grid has exactly one solution
 * @param {number[][]} grid - The grid to check
 * @returns {boolean} True if the grid has exactly one solution, false otherwise
 */
function hasUniqueSolution(grid) {
	// We'll use a separate counter object to track solutions
	const counter = { count: 0 };

	// Find an empty cell to start with
	const emptyCell = findEmptyCell(grid);
	if (!emptyCell) return true; // If grid is already filled, it has one solution

	// Try to find multiple solutions
	countSolutions(grid, counter);

	// If we found exactly one solution, return true
	return counter.count === 1;
}

/**
 * Count the number of solutions for a given grid
 * @param {number[][]} grid - The sudoku grid
 * @param {Object} counter - Object with count property to track solutions
 * @returns {boolean} True if we should stop searching (found multiple solutions)
 */
function countSolutions(grid, counter) {
	// If we already found more than one solution, stop searching
	if (counter.count > 1) return true;

	// Find an empty cell
	const emptyCell = findEmptyCell(grid);

	// If no empty cell, we found a solution
	if (!emptyCell) {
		counter.count++;
		return counter.count > 1; // Stop if we found multiple solutions
	}

	const [row, col] = emptyCell;

	// Try each possible value for this cell
	for (let num = 1; num <= 9; num++) {
		if (isSafe(grid, row, col, num)) {
			grid[row][col] = num;

			// Recursively search for solutions
			if (countSolutions(grid, counter)) {
				return true; // Stop if we found multiple solutions
			}

			// Backtrack
			grid[row][col] = 0;
		}
	}

	return false;
}
