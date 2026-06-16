export type CandyColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'multicolor';
export type CandyType = 'standard' | 'striped_h' | 'striped_v' | 'wrapped' | 'color_bomb';

export interface Candy {
	id: string;
	color: CandyColor;
	type: CandyType;
}

export type BoardGrid = (Candy | null)[][];

export const CANDY_COLORS: CandyColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

// Helper to generate a unique ID
export function generateId(): string {
	return Math.random().toString(36).substring(2, 9);
}

// Create a new candy object
export function createCandy(color: CandyColor, type: CandyType = 'standard'): Candy {
	return {
		id: generateId(),
		color,
		type
	};
}

// Initialize board with no initial matches
export function createBoard(rows: number, cols: number): BoardGrid {
	const grid: BoardGrid = Array(rows).fill(null).map(() => Array(cols).fill(null));

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			let allowedColors = [...CANDY_COLORS];

			// Prevent horizontal match 3
			if (c >= 2) {
				const c1 = grid[r][c - 1];
				const c2 = grid[r][c - 2];
				if (c1 && c2 && c1.color === c2.color) {
					allowedColors = allowedColors.filter(col => col !== c1.color);
				}
			}

			// Prevent vertical match 3
			if (r >= 2) {
				const r1 = grid[r - 1][c];
				const r2 = grid[r - 2][c];
				if (r1 && r2 && r1.color === r2.color) {
					allowedColors = allowedColors.filter(col => col !== r1.color);
				}
			}

			const randomColor = allowedColors[Math.floor(Math.random() * allowedColors.length)];
			grid[r][c] = createCandy(randomColor);
		}
	}

	return grid;
}

// Find all matches on the board
export interface MatchInfo {
	coords: { r: number; c: number }[];
	color: CandyColor;
	type: 'horizontal' | 'vertical' | 'intersection';
}

export function findMatchGroups(grid: BoardGrid): MatchInfo[] {
	const rows = grid.length;
	const cols = grid[0].length;
	const horizontalMatches: MatchInfo[] = [];
	const verticalMatches: MatchInfo[] = [];

	// 1. Scan horizontal
	for (let r = 0; r < rows; r++) {
		let matchCount = 1;
		let matchColor: CandyColor | null = null;
		let startCol = 0;

		for (let c = 0; c < cols; c++) {
			const candy = grid[r][c];
			const color = candy ? candy.color : null;

			// Color bomb itself doesn't match color-wise in standard ways unless explicitly swapped
			const isMatchable = color && color !== 'multicolor';

			if (isMatchable && color === matchColor) {
				matchCount++;
			} else {
				if (matchCount >= 3 && matchColor) {
					const coords = [];
					for (let i = startCol; i < startCol + matchCount; i++) {
						coords.push({ r, c: i });
					}
					horizontalMatches.push({ coords, color: matchColor, type: 'horizontal' });
				}
				matchColor = isMatchable ? color : null;
				matchCount = 1;
				startCol = c;
			}
		}
		// End of row check
		if (matchCount >= 3 && matchColor) {
			const coords = [];
			for (let i = startCol; i < startCol + matchCount; i++) {
				coords.push({ r, c: i });
			}
			horizontalMatches.push({ coords, color: matchColor, type: 'horizontal' });
		}
	}

	// 2. Scan vertical
	for (let c = 0; c < cols; c++) {
		let matchCount = 1;
		let matchColor: CandyColor | null = null;
		let startRow = 0;

		for (let r = 0; r < rows; r++) {
			const candy = grid[r][c];
			const color = candy ? candy.color : null;
			const isMatchable = color && color !== 'multicolor';

			if (isMatchable && color === matchColor) {
				matchCount++;
			} else {
				if (matchCount >= 3 && matchColor) {
					const coords = [];
					for (let i = startRow; i < startRow + matchCount; i++) {
						coords.push({ r: i, c });
					}
					verticalMatches.push({ coords, color: matchColor, type: 'vertical' });
				}
				matchColor = isMatchable ? color : null;
				matchCount = 1;
				startRow = r;
			}
		}
		// End of col check
		if (matchCount >= 3 && matchColor) {
			const coords = [];
			for (let i = startRow; i < startRow + matchCount; i++) {
				coords.push({ r: i, c });
			}
			verticalMatches.push({ coords, color: matchColor, type: 'vertical' });
		}
	}

	// Combine matches. We need to identify L/T shapes (intersections)
	const combinedMatches: MatchInfo[] = [];

	// We map coordinates to matches to find intersections
	const hCoordsMap = new Map<string, MatchInfo>();
	horizontalMatches.forEach(hm => {
		hm.coords.forEach(coord => {
			hCoordsMap.set(`${coord.r},${coord.c}`, hm);
		});
	});

	const usedVMatches = new Set<MatchInfo>();

	// For each vertical match, check if any of its cells intersect with a horizontal match of the same color
	verticalMatches.forEach(vm => {
		let intersectionFound = false;
		let intersectingHMatch: MatchInfo | null = null;
		let intersectionCoord: { r: number; c: number } | null = null;

		for (const coord of vm.coords) {
			const key = `${coord.r},${coord.c}`;
			if (hCoordsMap.has(key)) {
				const hm = hCoordsMap.get(key)!;
				if (hm.color === vm.color) {
					intersectionFound = true;
					intersectingHMatch = hm;
					intersectionCoord = coord;
					break;
				}
			}
		}

		if (intersectionFound && intersectingHMatch && intersectionCoord) {
			// Create an intersection L/T shape match
			const mergedCoordsMap = new Map<string, { r: number; c: number }>();
			intersectingHMatch.coords.forEach(co => mergedCoordsMap.set(`${co.r},${co.c}`, co));
			vm.coords.forEach(co => mergedCoordsMap.set(`${co.r},${co.c}`, co));

			const mergedCoords = Array.from(mergedCoordsMap.values());
			combinedMatches.push({
				coords: mergedCoords,
				color: vm.color,
				type: 'intersection'
			});

			// Remove the horizontal match from standard lists since it's merged
			const idx = combinedMatches.findIndex(m => m.coords === intersectingHMatch!.coords);
			if (idx !== -1) combinedMatches.splice(idx, 1);
			usedVMatches.add(vm);

			// Remove from hCoordsMap so we don't merge it again
			intersectingHMatch.coords.forEach(co => hCoordsMap.delete(`${co.r},${co.c}`));
		} else {
			combinedMatches.push(vm);
		}
	});

	// Add any horizontal matches that weren't merged
	const addedHMatches = new Set<MatchInfo>();
	hCoordsMap.forEach(hm => {
		if (!addedHMatches.has(hm)) {
			combinedMatches.push(hm);
			addedHMatches.add(hm);
		}
	});

	return combinedMatches;
}

// Special candies trigger blasts that destroy other candies
export function processBlasts(
	grid: BoardGrid,
	initialDestroySet: Set<string>
): { destroyed: Set<string>; triggeredSpecialDetails: { r: number; c: number; type: CandyType; color: CandyColor }[] } {
	const rows = grid.length;
	const cols = grid[0].length;
	const destroyed = new Set<string>(initialDestroySet);
	const processedSpecial = new Set<string>();
	const triggeredSpecialDetails: { r: number; c: number; type: CandyType; color: CandyColor }[] = [];

	let newlyAdded = true;

	while (newlyAdded) {
		newlyAdded = false;

		// Scan grid to find special candies that are within the 'destroyed' set but haven't been 'processed'
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const key = `${r},${c}`;
				if (destroyed.has(key) && !processedSpecial.has(key)) {
					const candy = grid[r][c];
					if (candy && candy.type !== 'standard') {
						processedSpecial.add(key);
						triggeredSpecialDetails.push({ r, c, type: candy.type, color: candy.color });

						// Trigger the special ability
						if (candy.type === 'striped_h') {
							// Destroy entire row
							for (let col = 0; col < cols; col++) {
								const targetKey = `${r},${col}`;
								if (!destroyed.has(targetKey)) {
									destroyed.add(targetKey);
									newlyAdded = true;
								}
							}
						} else if (candy.type === 'striped_v') {
							// Destroy entire column
							for (let row = 0; row < rows; row++) {
								const targetKey = `${row},${c}`;
								if (!destroyed.has(targetKey)) {
									destroyed.add(targetKey);
									newlyAdded = true;
								}
							}
						} else if (candy.type === 'wrapped') {
							// Destroy 3x3 area
							for (let dr = -1; dr <= 1; dr++) {
								for (let dc = -1; dc <= 1; dc++) {
									const nr = r + dr;
									const nc = c + dc;
									if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
										const targetKey = `${nr},${nc}`;
										if (!destroyed.has(targetKey)) {
											destroyed.add(targetKey);
											newlyAdded = true;
										}
									}
								}
							}
						} else if (candy.type === 'color_bomb') {
							// Normal match of color bomb triggers random color destruction
							const availableColors = CANDY_COLORS.filter(col => col !== 'multicolor');
							const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
							for (let row = 0; row < rows; row++) {
								for (let col = 0; col < cols; col++) {
									const item = grid[row][col];
									if (item && item.color === randomColor) {
										const targetKey = `${row},${col}`;
										if (!destroyed.has(targetKey)) {
											destroyed.add(targetKey);
											newlyAdded = true;
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}

	return { destroyed, triggeredSpecialDetails };
}

// Swap two cells, verify if it creates a match, and handle special Color Bomb swaps
export interface SwapResult {
	valid: boolean;
	specialAction?: 'color_bomb_swap' | 'wrapped_wrapped' | 'striped_striped' | 'striped_wrapped';
	matchedKeys?: Set<string>;
	specialSpawns?: { r: number; c: number; candy: Candy }[];
}

export function swapAndEvaluate(
	grid: BoardGrid,
	r1: number,
	c1: number,
	r2: number,
	c2: number
): SwapResult {
	const rows = grid.length;
	const cols = grid[0].length;

	// Check boundary
	if (r1 < 0 || r1 >= rows || c1 < 0 || c1 >= cols || r2 < 0 || r2 >= rows || c2 < 0 || c2 >= cols) {
		return { valid: false };
	}

	const candy1 = grid[r1][c1];
	const candy2 = grid[r2][c2];

	if (!candy1 || !candy2) return { valid: false };

	// 1. Check special combinations
	// Combo 1: Color Bomb + standard or special
	if (candy1.type === 'color_bomb' || candy2.type === 'color_bomb') {
		const targetColor = candy1.type === 'color_bomb' ? candy2.color : candy1.color;
		const destroyed = new Set<string>();
		destroyed.add(`${r1},${c1}`);
		destroyed.add(`${r2},${c2}`);

		// If color bomb + color bomb, clear the whole board!
		if (candy1.type === 'color_bomb' && candy2.type === 'color_bomb') {
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					destroyed.add(`${r},${c}`);
				}
			}
		} else {
			// Clear all candies of the target color
			for (let r = 0; r < rows; r++) {
				for (let c = 0; c < cols; c++) {
					const item = grid[r][c];
					if (item && (item.color === targetColor || item.type === 'color_bomb')) {
						destroyed.add(`${r},${c}`);
					}
				}
			}
		}

		// Process chain reactions of any hit special candies
		const blastResult = processBlasts(grid, destroyed);
		return {
			valid: true,
			specialAction: 'color_bomb_swap',
			matchedKeys: blastResult.destroyed
		};
	}

	// Combo 2: Striped + Striped, Wrapped + Wrapped, Striped + Wrapped
	const isStriped = (c: Candy) => c.type === 'striped_h' || c.type === 'striped_v';
	const isWrapped = (c: Candy) => c.type === 'wrapped';

	if (isStriped(candy1) && isStriped(candy2)) {
		// Clears both row and column of the swap point
		const destroyed = new Set<string>();
		for (let row = 0; row < rows; row++) destroyed.add(`${row},${c2}`);
		for (let col = 0; col < cols; col++) destroyed.add(`${r2},${col}`);
		const blastResult = processBlasts(grid, destroyed);
		return {
			valid: true,
			specialAction: 'striped_striped',
			matchedKeys: blastResult.destroyed
		};
	}

	if (isWrapped(candy1) && isWrapped(candy2)) {
		// Giant 5x5 explosion
		const destroyed = new Set<string>();
		for (let dr = -2; dr <= 2; dr++) {
			for (let dc = -2; dc <= 2; dc++) {
				const nr = r2 + dr;
				const nc = c2 + dc;
				if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
					destroyed.add(`${nr},${nc}`);
				}
			}
		}
		const blastResult = processBlasts(grid, destroyed);
		return {
			valid: true,
			specialAction: 'wrapped_wrapped',
			matchedKeys: blastResult.destroyed
		};
	}

	if ((isStriped(candy1) && isWrapped(candy2)) || (isWrapped(candy1) && isStriped(candy2))) {
		// Clears 3 rows and 3 columns centered on the swap point
		const destroyed = new Set<string>();
		for (let dr = -1; dr <= 1; dr++) {
			const row = r2 + dr;
			if (row >= 0 && row < rows) {
				for (let col = 0; col < cols; col++) destroyed.add(`${row},${col}`);
			}
		}
		for (let dc = -1; dc <= 1; dc++) {
			const col = c2 + dc;
			if (col >= 0 && col < cols) {
				for (let row = 0; row < rows; row++) destroyed.add(`${row},${col}`);
			}
		}
		const blastResult = processBlasts(grid, destroyed);
		return {
			valid: true,
			specialAction: 'striped_wrapped',
			matchedKeys: blastResult.destroyed
		};
	}

	// 2. Perform temporary swap
	grid[r1][c1] = candy2;
	grid[r2][c2] = candy1;

	// Evaluate matches
	const matchGroups = findMatchGroups(grid);

	if (matchGroups.length === 0) {
		// Undo swap
		grid[r1][c1] = candy1;
		grid[r2][c2] = candy2;
		return { valid: false };
	}

	// Calculate destroyed cells and special spawns
	const matchedKeys = new Set<string>();
	const specialSpawns: { r: number; c: number; candy: Candy }[] = [];

	matchGroups.forEach(group => {
		group.coords.forEach(coord => matchedKeys.add(`${coord.r},${coord.c}`));

		// Special Candy Spawn rules:
		let spawnR = r2; // Default to swap target cell
		let spawnC = c2;

		// If swap cells are not in this group, choose center or swap source
		const hasSwapTarget = group.coords.some(co => co.r === r2 && co.c === c2);
		const hasSwapSource = group.coords.some(co => co.r === r1 && co.c === c1);

		if (hasSwapTarget) {
			spawnR = r2;
			spawnC = c2;
		} else if (hasSwapSource) {
			spawnR = r1;
			spawnC = c1;
		} else {
			// Cascade match or other group, spawn in center of the match
			const centerCoord = group.coords[Math.floor(group.coords.length / 2)];
			spawnR = centerCoord.r;
			spawnC = centerCoord.c;
		}

		if (group.type === 'intersection') {
			// L or T shape -> Wrapped Candy
			specialSpawns.push({
				r: spawnR,
				c: spawnC,
				candy: createCandy(group.color, 'wrapped')
			});
		} else if (group.coords.length >= 5) {
			// Match 5 -> Color Bomb
			specialSpawns.push({
				r: spawnR,
				c: spawnC,
				candy: createCandy('multicolor', 'color_bomb')
			});
		} else if (group.coords.length === 4) {
			// Match 4 -> Striped Candy
			// Stripe orientation based on direction of match
			const type = group.type === 'horizontal' ? 'striped_v' : 'striped_h';
			specialSpawns.push({
				r: spawnR,
				c: spawnC,
				candy: createCandy(group.color, type)
			});
		}
	});

	// Trigger blasts for any special candies that are matched
	const blastResult = processBlasts(grid, matchedKeys);

	// Remove spawned locations from matched keys so we overwrite them with the spawned special candy
	specialSpawns.forEach(spawn => {
		blastResult.destroyed.delete(`${spawn.r},${spawn.c}`);
	});

	// Put candies back to evaluate them in the loop caller or keep them swapped
	// In the real store, we will apply the swap permanently if valid. We leave them swapped here for the caller.
	return {
		valid: true,
		matchedKeys: blastResult.destroyed,
		specialSpawns
	};
}

// Simulates candy gravity and new candy spawn
export interface CascadeResult {
	newGrid: BoardGrid;
	fallTransitions: { fromR: number; fromC: number; toR: number; toC: number; candy: Candy }[];
	spawns: { r: number; c: number; candy: Candy }[];
}

export function applyCascade(grid: BoardGrid): CascadeResult {
	const rows = grid.length;
	const cols = grid[0].length;
	const newGrid: BoardGrid = Array(rows).fill(null).map(() => Array(cols).fill(null));
	const fallTransitions: { fromR: number; fromC: number; toR: number; toC: number; candy: Candy }[] = [];
	const spawns: { r: number; c: number; candy: Candy }[] = [];

	// Process column by column
	for (let c = 0; c < cols; c++) {
		let writeRow = rows - 1;

		// Move existing candies down
		for (let r = rows - 1; r >= 0; r--) {
			if (grid[r][c] !== null) {
				newGrid[writeRow][c] = grid[r][c];
				if (writeRow !== r) {
					fallTransitions.push({
						fromR: r,
						fromC: c,
						toR: writeRow,
						toC: c,
						candy: grid[r][c]!
					});
				}
				writeRow--;
			}
		}

		// Spawn new candies in empty slots
		for (let r = writeRow; r >= 0; r--) {
			const randomColor = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
			const newCandy = createCandy(randomColor);
			newGrid[r][c] = newCandy;
			spawns.push({
				r,
				c,
				candy: newCandy
			});
		}
	}

	return {
		newGrid,
		fallTransitions,
		spawns
	};
}

// Check if there is any valid move left on the board
export function hasValidMoves(grid: BoardGrid): boolean {
	const rows = grid.length;
	const cols = grid[0].length;

	const matchesExist = findMatchGroups(grid).length > 0;
	if (matchesExist) return true;

	const testSwap = (r1: number, c1: number, r2: number, c2: number): boolean => {
		if (r2 < 0 || r2 >= rows || c2 < 0 || c2 >= cols) return false;

		const candy1 = grid[r1][c1];
		const candy2 = grid[r2][c2];
		if (!candy1 || !candy2) return false;

		// Color bomb swap is always valid if next to anything
		if (candy1.type === 'color_bomb' || candy2.type === 'color_bomb') return true;

		// Swap
		grid[r1][c1] = candy2;
		grid[r2][c2] = candy1;

		const groups = findMatchGroups(grid);

		// Revert
		grid[r1][c1] = candy1;
		grid[r2][c2] = candy2;

		return groups.length > 0;
	};

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			// Test horizontal swap with right neighbor
			if (testSwap(r, c, r, c + 1)) return true;
			// Test vertical swap with bottom neighbor
			if (testSwap(r, c, r + 1, c)) return true;
		}
	}

	return false;
}

// Shuffle the board such that matches are prevented, but at least one valid move is available
export function shuffleBoard(grid: BoardGrid): BoardGrid {
	const rows = grid.length;
	const cols = grid[0].length;
	let shuffled: BoardGrid = [];

	let attempts = 0;
	while (attempts < 100) {
		attempts++;

		// 1. Gather all current candies
		const candies: Candy[] = [];
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				if (grid[r][c]) candies.push(grid[r][c]!);
			}
		}

		// 2. Shuffle candies array
		for (let i = candies.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[candies[i], candies[j]] = [candies[j], candies[i]];
		}

		// 3. Put back in grid, checking for matches
		shuffled = Array(rows).fill(null).map(() => Array(cols).fill(null));
		let candyIdx = 0;
		let validPlacement = true;

		for (let r = 0; r < rows && validPlacement; r++) {
			for (let c = 0; c < cols; c++) {
				// We want to avoid creating immediate match 3s
				const currentCandy = candies[candyIdx++];
				shuffled[r][c] = currentCandy;

				// Verify immediate match 3
				if (c >= 2) {
					const c1 = shuffled[r][c - 1];
					const c2 = shuffled[r][c - 2];
					if (c1 && c2 && c1.color === c2.color && currentCandy.color === c1.color) {
						validPlacement = false;
						break;
					}
				}
				if (r >= 2) {
					const r1 = shuffled[r - 1][c];
					const r2 = shuffled[r - 2][c];
					if (r1 && r2 && r1.color === r2.color && currentCandy.color === r1.color) {
						validPlacement = false;
						break;
					}
				}
			}
		}

		// 4. If grid is filled without matches, check if it has valid moves
		if (validPlacement && hasValidMoves(shuffled)) {
			return shuffled;
		}
	}

	// Fallback to fresh board if shuffling fails
	return createBoard(rows, cols);
}
