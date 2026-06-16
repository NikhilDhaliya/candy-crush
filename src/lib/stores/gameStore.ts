import { writable, get } from 'svelte/store';
import {
	createBoard,
	swapAndEvaluate,
	applyCascade,
	findMatchGroups,
	hasValidMoves,
	shuffleBoard,
	processBlasts,
	createCandy,
	type BoardGrid,
	type Candy,
	type CandyColor,
	type CandyType
} from '../utils/matchEngine';
import { playSound } from '../utils/audioManager.js';

// Level Goal Definition
export interface LevelGoal {
	type: 'score' | 'collect' | 'combo';
	targetScore: number;
	collectColors?: { color: CandyColor; target: number; current: number }[];
	targetCombos?: number; // target number of combos
	currentCombos?: number;
}

// Level Definition
export interface LevelConfig {
	id: number;
	name: string;
	description: string;
	type: 'score' | 'collect' | 'combo' | 'time';
	movesLimit?: number;
	timeLimit?: number; // in seconds
	goal: LevelGoal;
	starThresholds: [number, number, number]; // [1star, 2stars, 3stars]
}

// Available Levels 1 to 20
export const LEVELS: LevelConfig[] = [
	{
		id: 1,
		name: "Lemonade Lagoon",
		description: "Reach 1,000 points to start your adventure!",
		type: "score",
		movesLimit: 25,
		goal: { type: 'score', targetScore: 1000 },
		starThresholds: [1000, 2500, 5000]
	},
	{
		id: 2,
		name: "Cherry Chasm",
		description: "Collect 20 Red and 20 Blue candies!",
		type: "collect",
		movesLimit: 25,
		goal: {
			type: 'collect',
			targetScore: 500,
			collectColors: [
				{ color: 'red', target: 20, current: 0 },
				{ color: 'blue', target: 20, current: 0 }
			]
		},
		starThresholds: [500, 1500, 3000]
	},
	{
		id: 3,
		name: "Orange Oasis",
		description: "Trigger 3 cascades (Combo x3) in a single turn!",
		type: "combo",
		movesLimit: 30,
		goal: {
			type: 'combo',
			targetScore: 800,
			targetCombos: 3,
			currentCombos: 0
		},
		starThresholds: [800, 2000, 4000]
	},
	{
		id: 4,
		name: "Minty Meadows",
		description: "Quick! Earn 1,500 points in 60 seconds!",
		type: "time",
		timeLimit: 60,
		goal: { type: 'score', targetScore: 1500 },
		starThresholds: [1500, 3000, 6000]
	},
	{
		id: 5,
		name: "Grape Gardens",
		description: "Collect 30 Purple candies!",
		type: "collect",
		movesLimit: 20,
		goal: {
			type: 'collect',
			targetScore: 1000,
			collectColors: [
				{ color: 'purple', target: 30, current: 0 }
			]
		},
		starThresholds: [1000, 2500, 5000]
	},
	{
		id: 6,
		name: "Bubbly Beach",
		description: "Reach a score of 3,000 with 30 moves.",
		type: "score",
		movesLimit: 30,
		goal: { type: 'score', targetScore: 3000 },
		starThresholds: [3000, 6000, 10000]
	},
	{
		id: 7,
		name: "Lime Light",
		description: "Collect 25 Green and 25 Orange candies.",
		type: "collect",
		movesLimit: 24,
		goal: {
			type: 'collect',
			targetScore: 800,
			collectColors: [
				{ color: 'green', target: 25, current: 0 },
				{ color: 'orange', target: 25, current: 0 }
			]
		},
		starThresholds: [800, 2000, 4000]
	},
	{
		id: 8,
		name: "Toffee Town",
		description: "Achieve a Combo x4 cascade!",
		type: "combo",
		movesLimit: 25,
		goal: {
			type: 'combo',
			targetScore: 1200,
			targetCombos: 4,
			currentCombos: 0
		},
		starThresholds: [1200, 3000, 5000]
	},
	{
		id: 9,
		name: "Licorice Land",
		description: "Race against the clock: 2,500 points in 45 seconds!",
		type: "time",
		timeLimit: 45,
		goal: { type: 'score', targetScore: 2500 },
		starThresholds: [2500, 5000, 8000]
	},
	{
		id: 10,
		name: "Chocolate Cliffs",
		description: "Collect 40 Yellow candies in 22 moves.",
		type: "collect",
		movesLimit: 22,
		goal: {
			type: 'collect',
			targetScore: 1000,
			collectColors: [
				{ color: 'yellow', target: 40, current: 0 }
			]
		},
		starThresholds: [1000, 2500, 5000]
	},
	{
		id: 11,
		name: "Marshmallow Mount",
		description: "Score 4,000 points before running out of moves.",
		type: "score",
		movesLimit: 25,
		goal: { type: 'score', targetScore: 4000 },
		starThresholds: [4000, 8000, 12000]
	},
	{
		id: 12,
		name: "Candy Cane Coast",
		description: "Collect 20 of each: Red, Yellow, and Blue!",
		type: "collect",
		movesLimit: 28,
		goal: {
			type: 'collect',
			targetScore: 1500,
			collectColors: [
				{ color: 'red', target: 20, current: 0 },
				{ color: 'yellow', target: 20, current: 0 },
				{ color: 'blue', target: 20, current: 0 }
			]
		},
		starThresholds: [1500, 3500, 6000]
	},
	{
		id: 13,
		name: "Pecan Peak",
		description: "Trigger a Combo x3. Time limit: 60 seconds!",
		type: "time",
		timeLimit: 60,
		goal: { type: 'score', targetScore: 2000 },
		starThresholds: [2000, 4000, 7000]
	},
	{
		id: 14,
		name: "Shed Sour",
		description: "Trigger 4 cascades in a single turn.",
		type: "combo",
		movesLimit: 30,
		goal: {
			type: 'combo',
			targetScore: 1000,
			targetCombos: 4,
			currentCombos: 0
		},
		starThresholds: [1000, 2500, 5000]
	},
	{
		id: 15,
		name: "Bubblegum Bridge",
		description: "Super score challenge: Reach 6,000 points!",
		type: "score",
		movesLimit: 35,
		goal: { type: 'score', targetScore: 6000 },
		starThresholds: [6000, 12000, 18000]
	},
	{
		id: 16,
		name: "Caramel Canyon",
		description: "Collect 50 Green candies in 25 moves.",
		type: "collect",
		movesLimit: 25,
		goal: {
			type: 'collect',
			targetScore: 1200,
			collectColors: [
				{ color: 'green', target: 50, current: 0 }
			]
		},
		starThresholds: [1200, 3000, 6000]
	},
	{
		id: 17,
		name: "Fudge Falls",
		description: "Quick collection: 35 Red candies in 30 seconds!",
		type: "time",
		timeLimit: 30,
		goal: { type: 'score', targetScore: 1200 },
		starThresholds: [1200, 2500, 4500]
	},
	{
		id: 18,
		name: "Truffle Terrace",
		description: "Reach 5,000 points in 22 moves.",
		type: "score",
		movesLimit: 22,
		goal: { type: 'score', targetScore: 5000 },
		starThresholds: [5000, 9000, 14000]
	},
	{
		id: 19,
		name: "Jelly Jungle",
		description: "Collect 35 Purple and 35 Orange candies.",
		type: "collect",
		movesLimit: 26,
		goal: {
			type: 'collect',
			targetScore: 1500,
			collectColors: [
				{ color: 'purple', target: 35, current: 0 },
				{ color: 'orange', target: 35, current: 0 }
			]
		},
		starThresholds: [1500, 3500, 6000]
	},
	{
		id: 20,
		name: "Jacks Club Castle",
		description: "The ultimate challenge: Achieve 10,000 points in 40 moves!",
		type: "score",
		movesLimit: 40,
		goal: { type: 'score', targetScore: 10000 },
		starThresholds: [10000, 20000, 35000]
	}
];

export interface PlayerProgress {
	unlocked: boolean;
	stars: number;
	highscore: number;
}

export interface BoardFx {
	id: number;
	kind:
	| 'idle'
	| 'swap'
	| 'invalid'
	| 'match'
	| 'cascade'
	| 'booster'
	| 'shuffle'
	| 'settle';
	swap?: { r1: number; c1: number; r2: number; c2: number };
	keys?: string[];
	fallTransitions?: { fromR: number; fromC: number; toR: number; toC: number; candyId: string }[];
	spawns?: { r: number; c: number; candyId: string }[];
	scoreDelta?: number;
	combo?: number;
	origin?: { r: number; c: number };
}

export interface GameState {
	screen: 'splash' | 'menu' | 'map' | 'game';
	levelIndex: number;
	levelsProgress: PlayerProgress[];
	coins: number;
	score: number;
	movesLeft: number;
	timeLeft: number;
	goal: LevelGoal;
	board: BoardGrid;
	locked: boolean;
	matchingKeys: Set<string>; // active matching animations
	boardFx: BoardFx;
	comboCount: number; // consecutive cascade count
	comboMessage: string; // "Sweet!", "Tasty!", "Delicious!"
	showComboBanner: boolean;
	winPopup: boolean;
	losePopup: boolean;
	colorBlindMode: boolean;
	soundOn: boolean;
	musicOn: boolean;
	selectedBooster: 'hammer' | 'shuffle' | 'row_blast' | null;
	boostersCount: {
		hammer: number;
		shuffle: number;
		row_blast: number;
	};
}

// Load progression from local storage if available
const initialLevelsProgress: PlayerProgress[] = Array(LEVELS.length)
	.fill(null)
	.map((_, i) => ({
		unlocked: i === 0,
		stars: 0,
		highscore: 0
	}));

let savedProgress = null;
if (typeof window !== 'undefined') {
	const data = localStorage.getItem('candy_crush_progress');
	if (data) {
		try {
			savedProgress = JSON.parse(data);
		} catch (e) {
			console.error(e);
		}
	}
}

const defaultState: GameState = {
	screen: 'splash',
	levelIndex: 0,
	levelsProgress: savedProgress || initialLevelsProgress,
	coins: savedProgress ? (savedProgress.coins ?? 120) : 120,
	score: 0,
	movesLeft: 0,
	timeLeft: 0,
	goal: { type: 'score', targetScore: 1000 },
	board: [],
	locked: false,
	matchingKeys: new Set(),
	boardFx: { id: 0, kind: 'idle' },
	comboCount: 0,
	comboMessage: '',
	showComboBanner: false,
	winPopup: false,
	losePopup: false,
	colorBlindMode: false,
	soundOn: true,
	musicOn: true,
	selectedBooster: null,
	boostersCount: {
		hammer: 3,
		shuffle: 2,
		row_blast: 1
	}
};

const store = writable<GameState>(defaultState);
let timerInterval: any = null;
let fxSeq = 0;

function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function nextFx(fx: Omit<BoardFx, 'id'>): BoardFx {
	return { id: ++fxSeq, ...fx };
}

// Helper to save state to localStorage
function saveProgress(state: GameState) {
	if (typeof window !== 'undefined') {
		localStorage.setItem(
			'candy_crush_progress',
			JSON.stringify({
				levelsProgress: state.levelsProgress,
				coins: state.coins
			})
		);
	}
}

export const gameStore = {
	subscribe: store.subscribe,

	setScreen: (screen: 'splash' | 'menu' | 'map' | 'game') => {
		if (screen !== 'game') {
			if (timerInterval) {
				clearInterval(timerInterval);
				timerInterval = null;
			}
		}
		store.update(s => ({ ...s, screen, selectedBooster: null }));
	},

	toggleColorBlind: () => {
		store.update(s => ({ ...s, colorBlindMode: !s.colorBlindMode }));
	},

	toggleSound: () => {
		store.update(s => ({ ...s, soundOn: !s.soundOn }));
	},

	toggleMusic: () => {
		store.update(s => {
			const val = !s.musicOn;
			// Play or stop music accordingly
			return { ...s, musicOn: val };
		});
	},

	startGame: (levelIdx: number) => {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}

		const level = LEVELS[levelIdx];
		const freshBoard = createBoard(8, 8);

		// Deep clone goal
		const goal: LevelGoal = JSON.parse(JSON.stringify(level.goal));

		store.update(s => {
			const newState: GameState = {
				...s,
				screen: 'game',
				levelIndex: levelIdx,
				score: 0,
				movesLeft: level.movesLimit || 0,
				timeLeft: level.timeLimit || 0,
				goal,
				board: freshBoard,
				locked: false,
				matchingKeys: new Set(),
				boardFx: nextFx({ kind: 'cascade' }),
				comboCount: 0,
				comboMessage: '',
				showComboBanner: false,
				winPopup: false,
				losePopup: false,
				selectedBooster: null
			};

			// Handle time levels
			if (level.type === 'time' && level.timeLimit) {
				timerInterval = setInterval(() => {
					store.update(curr => {
						if (curr.screen !== 'game' || curr.winPopup || curr.losePopup) {
							clearInterval(timerInterval);
							return curr;
						}

						const newTime = curr.timeLeft - 1;
						if (newTime <= 0) {
							clearInterval(timerInterval);
							playSound('defeat');
							// Check if goal was met at the last second
							const didWin = gameStore.evaluateWinCondition(curr);
							return {
								...curr,
								timeLeft: 0,
								winPopup: didWin,
								losePopup: !didWin,
								locked: true
							};
						}
						return { ...curr, timeLeft: newTime };
					});
				}, 1000);
			}

			playSound('victory', 0.2); // short start sound

			return newState;
		});
	},

	// Run validation of winning objectives
	evaluateWinCondition: (state: GameState): boolean => {
		const level = LEVELS[state.levelIndex];
		if (state.score < level.goal.targetScore) return false;

		if (state.goal.type === 'collect' && state.goal.collectColors) {
			const completed = state.goal.collectColors.every(c => c.current >= c.target);
			if (!completed) return false;
		}

		if (state.goal.type === 'combo' && state.goal.targetCombos !== undefined && state.goal.currentCombos !== undefined) {
			if (state.goal.currentCombos < state.goal.targetCombos) return false;
		}

		return true;
	},

	// Select or deselect a booster
	selectBooster: (booster: 'hammer' | 'shuffle' | 'row_blast' | null) => {
		store.update(s => {
			if (s.locked) return s;
			return {
				...s,
				selectedBooster: s.selectedBooster === booster ? null : booster
			};
		});
	},

	// Trigger custom Booster effect on tile
	applyBooster: async (r: number, c: number) => {
		const state = get(store);
		if (state.locked || !state.selectedBooster) return;

		const booster = state.selectedBooster;
		const count = state.boostersCount[booster];
		if (count <= 0) return; // not enough booster charges

		store.update(s => ({
			...s,
			locked: true,
			selectedBooster: null,
			boostersCount: {
				...s.boostersCount,
				[booster]: count - 1
			}
		}));

		playSound('bomb');

		const tempBoard = JSON.parse(JSON.stringify(state.board)) as BoardGrid;
		const destroyedKeys = new Set<string>();

		if (booster === 'hammer') {
			destroyedKeys.add(`${r},${c}`);
		} else if (booster === 'row_blast') {
			for (let col = 0; col < 8; col++) {
				destroyedKeys.add(`${r},${col}`);
			}
		} else if (booster === 'shuffle') {
			const shuffled = shuffleBoard(tempBoard);
			store.update(s => ({
				...s,
				board: shuffled,
				boardFx: nextFx({ kind: 'shuffle' }),
				locked: false
			}));
			playSound('shuffle');
			return;
		}

		// Process special chain reactions from booster blast
		const blastResult = processBlasts(tempBoard, destroyedKeys);

		// Apply the destruction loop
		await gameStore.runCascadeSequence(tempBoard, blastResult.destroyed, [], 'booster');
	},

	// Perform a swap move
	makeSwapMove: async (r1: number, c1: number, r2: number, c2: number) => {
		const state = get(store);
		if (state.locked) return;

		store.update(s => ({ ...s, locked: true }));

		// Create deep copy of board
		const tempBoard = JSON.parse(JSON.stringify(state.board)) as BoardGrid;

		// Perform swap check
		const result = swapAndEvaluate(tempBoard, r1, c1, r2, c2);

		if (!result.valid) {
			// Visual feedback for failed swap: swap back and release lock
			playSound('invalid');
			store.update(s => ({
				...s,
				boardFx: nextFx({
					kind: 'invalid',
					swap: { r1, c1, r2, c2 }
				})
			}));
			await sleep(280);
			store.update(s => ({ ...s, boardFx: nextFx({ kind: 'idle' }), locked: false }));
			return;
		}

		// Valid swap! Deduct move
		playSound('swap');
		store.update(s => ({
			...s,
			board: tempBoard,
			boardFx: nextFx({
				kind: 'swap',
				swap: { r1, c1, r2, c2 }
			}),
			movesLeft: LEVELS[s.levelIndex].type !== 'time' ? s.movesLeft - 1 : s.movesLeft
		}));

		await sleep(190);

		// Apply the first cascade loop!
		await gameStore.runCascadeSequence(tempBoard, result.matchedKeys || new Set(), result.specialSpawns || []);
	},

	// Run recursive cascade-match loops
	runCascadeSequence: async (
		board: BoardGrid,
		destroyedKeys: Set<string>,
		specialSpawns: { r: number; c: number; candy: Candy }[],
		entryKind: BoardFx['kind'] = 'match'
	) => {
		let currentBoard = board;
		let keysToDestroy = destroyedKeys;
		let spawns = specialSpawns;

		let combo = 0;

		while (keysToDestroy.size > 0 || spawns.length > 0) {
			combo++;
			let pointsScored = 0;
			let origin: { r: number; c: number } | undefined;

			// 1. Trigger destruction visuals
			store.update(s => {
				// Process goal collections
				const goal = { ...s.goal };
				pointsScored = 0;
				origin = undefined;

				keysToDestroy.forEach(key => {
					const [r, c] = key.split(',').map(Number);
					origin = origin || { r, c };
					const candy = currentBoard[r][c];
					if (candy) {
						pointsScored += 60; // base candy points

						// Check collection goals
						if (goal.type === 'collect' && goal.collectColors) {
							goal.collectColors = goal.collectColors.map(gc => {
								if (gc.color === candy.color) {
									return { ...gc, current: gc.current + 1 };
								}
								return gc;
							});
						}
					}
				});

				// Combo points additions
				pointsScored += combo * 40;
				if (combo > 1) {
					// Increase combo goals
					if (goal.type === 'combo' && goal.currentCombos !== undefined) {
						goal.currentCombos = Math.max(goal.currentCombos, combo);
					}
				}

				// Apply points
				const newScore = s.score + pointsScored;

				// Visual combo popups
				let comboMsg = '';
				let showBanner = false;
				if (combo >= 4) {
					comboMsg = "Divine!";
					showBanner = true;
					playSound('victory');
				} else if (combo === 3) {
					comboMsg = "Delicious!";
					showBanner = true;
					playSound('victory');
				} else if (combo === 2) {
					comboMsg = "Tasty!";
					showBanner = true;
					playSound('victory');
				}

				return {
					...s,
					score: newScore,
					goal,
					matchingKeys: keysToDestroy,
					boardFx: nextFx({
						kind: entryKind === 'booster' || keysToDestroy.size >= 8 ? 'booster' : 'match',
						keys: Array.from(keysToDestroy),
						scoreDelta: pointsScored,
						combo,
						origin
					}),
					comboCount: combo,
					comboMessage: comboMsg,
					showComboBanner: showBanner
				};
			});

			playSound('match');
			if (keysToDestroy.size >= 8) playSound('bomb', 0.75);

			// Wait for explosion animation (200ms)
			await sleep(keysToDestroy.size >= 8 ? 320 : 240);

			// 2. Remove destroyed candies, insert special spawns
			for (let r = 0; r < 8; r++) {
				for (let c = 0; c < 8; c++) {
					if (keysToDestroy.has(`${r},${c}`)) {
						currentBoard[r][c] = null;
					}
				}
			}

			// Add specials
			spawns.forEach(spawn => {
				currentBoard[spawn.r][spawn.c] = spawn.candy;
			});

			store.update(s => ({
				...s,
				board: currentBoard,
				matchingKeys: new Set(),
				boardFx: nextFx({
					kind: 'settle',
					keys: Array.from(keysToDestroy),
					scoreDelta: pointsScored,
					combo,
					origin
				}),
				showComboBanner: false
			}));

			await sleep(70);

			// 3. Apply gravity cascades
			const cascade = applyCascade(currentBoard);
			currentBoard = cascade.newGrid;

			// Update board with fall translations
			store.update(s => ({
				...s,
				board: currentBoard,
				boardFx: nextFx({
					kind: 'cascade',
					fallTransitions: cascade.fallTransitions.map(fall => ({
						fromR: fall.fromR,
						fromC: fall.fromC,
						toR: fall.toR,
						toC: fall.toC,
						candyId: fall.candy.id
					})),
					spawns: cascade.spawns.map(spawn => ({
						r: spawn.r,
						c: spawn.c,
						candyId: spawn.candy.id
					}))
				})
			}));
			if (cascade.fallTransitions.length > 0 || cascade.spawns.length > 0) playSound('spawn', 0.65);

			// Wait for falling animations (250ms)
			await sleep(360);

			// 4. Scan for new matches created by falling candies
			const newMatches = findMatchGroups(currentBoard);

			if (newMatches.length > 0) {
				playSound('cascade', Math.min(1, 0.55 + combo * 0.12));
				// We have combo cascades!
				keysToDestroy = new Set<string>();
				spawns = [];

				newMatches.forEach(group => {
					group.coords.forEach(coord => keysToDestroy.add(`${coord.r},${coord.c}`));

					// Check center for match 4/5 spawns in cascades
					const center = group.coords[Math.floor(group.coords.length / 2)];
					if (group.type === 'intersection') {
						spawns.push({ r: center.r, c: center.c, candy: createCandy(group.color, 'wrapped') });
					} else if (group.coords.length >= 5) {
						spawns.push({ r: center.r, c: center.c, candy: createCandy('multicolor', 'color_bomb') });
					} else if (group.coords.length === 4) {
						const type = group.type === 'horizontal' ? 'striped_v' : 'striped_h';
						spawns.push({ r: center.r, c: center.c, candy: createCandy(group.color, type) });
					}
				});

				// Trigger blasts on specials
				const blastResult = processBlasts(currentBoard, keysToDestroy);
				keysToDestroy = blastResult.destroyed;

				// Filter out spawn points from keysToDestroy
				spawns.forEach(sp => keysToDestroy.delete(`${sp.r},${sp.c}`));
			} else {
				// No more matches, board is stable!
				keysToDestroy = new Set();
				spawns = [];
			}

			entryKind = 'match';
		}

		// Cascade sequence finished! Check game result
		store.update(s => {
			const didWin = gameStore.evaluateWinCondition(s);
			let winPopup = false;
			let losePopup = false;

			const level = LEVELS[s.levelIndex];

			if (didWin) {
				winPopup = true;
				playSound('victory');

				// Update levels unlocked and highscores
				const stars = gameStore.calculateStars(s.score, level.starThresholds);
				const nextLevelIndex = s.levelIndex + 1;

				const updatedProgress = s.levelsProgress.map((prog, idx) => {
					if (idx === s.levelIndex) {
						return {
							unlocked: true,
							stars: Math.max(prog.stars, stars),
							highscore: Math.max(prog.highscore, s.score)
						};
					}
					if (idx === nextLevelIndex) {
						return { ...prog, unlocked: true };
					}
					return prog;
				});

				// Give coin rewards for winning (e.g. 15 coins * stars)
				const coinReward = stars * 15;
				const newCoins = s.coins + coinReward;

				const updatedState = {
					...s,
					levelsProgress: updatedProgress,
					coins: newCoins,
					winPopup,
					locked: true
				};

				saveProgress(updatedState);
				return updatedState;
			} else if (level.type !== 'time' && s.movesLeft <= 0) {
				losePopup = true;
				playSound('defeat');
				return {
					...s,
					losePopup,
					locked: true
				};
			}

			// If board has no valid moves left, trigger Auto-Shuffle
			if (!hasValidMoves(s.board)) {
				setTimeout(() => {
					store.update(curr => {
						playSound('shuffle');
						const shuffled = shuffleBoard(curr.board);
						return { ...curr, board: shuffled, boardFx: nextFx({ kind: 'shuffle' }) };
					});
				}, 500);
			}

			return {
				...s,
				boardFx: nextFx({ kind: 'idle' }),
				locked: false
			};
		});
	},

	// Star milestones calculator
	calculateStars: (score: number, thresholds: [number, number, number]): number => {
		if (score >= thresholds[2]) return 3;
		if (score >= thresholds[1]) return 2;
		if (score >= thresholds[0]) return 1;
		return 0;
	},

	buyExtraMoves: () => {
		store.update(s => {
			if (s.coins < 50) return s; // need 50 coins
			return {
				...s,
				coins: s.coins - 50,
				movesLeft: s.movesLeft + 5,
				losePopup: false,
				locked: false
			};
		});
	},

	buyExtraTime: () => {
		store.update(s => {
			if (s.coins < 50) return s; // need 50 coins

			// Restart timer
			if (timerInterval) {
				clearInterval(timerInterval);
			}
			timerInterval = setInterval(() => {
				store.update(curr => {
					if (curr.screen !== 'game' || curr.winPopup || curr.losePopup) {
						clearInterval(timerInterval);
						return curr;
					}

					const newTime = curr.timeLeft - 1;
					if (newTime <= 0) {
						clearInterval(timerInterval);
						playSound('defeat');
						const didWin = gameStore.evaluateWinCondition(curr);
						return {
							...curr,
							timeLeft: 0,
							winPopup: didWin,
							losePopup: !didWin,
							locked: true
						};
					}
					return { ...curr, timeLeft: newTime };
				});
			}, 1000);

			return {
				...s,
				coins: s.coins - 50,
				timeLeft: s.timeLeft + 15,
				losePopup: false,
				locked: false
			};
		});
	},

	claimDailyCoins: () => {
		store.update(s => {
			const newCoins = s.coins + 50;
			const updatedState = { ...s, coins: newCoins };
			saveProgress(updatedState);
			return updatedState;
		});
	}
};
