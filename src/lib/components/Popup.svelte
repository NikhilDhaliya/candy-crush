<script lang="ts">
	import { gameStore, LEVELS } from '../stores/gameStore';
	import { playSound } from '../utils/audioManager';

	const level = $derived(LEVELS[$gameStore.levelIndex]);

	// Calculate stars for current score
	const starsEarned = $derived.by(() => {
		return gameStore.calculateStars($gameStore.score, level.starThresholds);
	});

	const scoreMet = $derived($gameStore.score >= level.goal.targetScore);

	const failureReason = $derived.by(() => {
		if (!scoreMet) return 'Target score not reached';
		if ($gameStore.goal.type === 'collect') return 'Collection goal not complete';
		if ($gameStore.goal.type === 'combo') return 'Cascade goal not complete';
		return level.type === 'time' ? 'Out of Time!' : 'Out of Moves!';
	});

	function handleNextLevel() {
		const nextIdx = $gameStore.levelIndex + 1;
		if (nextIdx < LEVELS.length) {
			gameStore.startGame(nextIdx);
		} else {
			gameStore.setScreen('map');
		}
	}

	function handleRetry() {
		gameStore.startGame($gameStore.levelIndex);
	}

	function handleBackToMap() {
		gameStore.setScreen('map');
	}
</script>

{#if $gameStore.winPopup}
	<div class="popup-backdrop">
		<div class="candy-panel popup-content win-popup-animation">
			<h1 class="popup-title win-title candy-text-stroke">Sweet!</h1>
			<p class="popup-level-name">Level {level.id} Completed</p>

			<!-- 3 Big Stars Display -->
			<div class="stars-container">
				<div class="big-star star-1" class:active={starsEarned >= 1}>★</div>
				<div class="big-star star-2" class:active={starsEarned >= 2}>★</div>
				<div class="big-star star-3" class:active={starsEarned >= 3}>★</div>
			</div>

			<!-- Rewards and Score -->
			<div class="stats-summary">
				<div class="stat-row">
					<span class="stat-label">Final Score:</span>
					<span class="stat-val candy-text-stroke">{$gameStore.score}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Reward:</span>
					<span class="stat-val reward-coins">🪙 +{starsEarned * 15} Coins</span>
				</div>
			</div>

			<!-- Action Buttons -->
			<div class="popup-actions">
				<button class="candy-btn candy-btn-orange" onclick={handleBackToMap}>
					Map
				</button>
				<button class="candy-btn candy-btn-green" onclick={handleNextLevel}>
					{#if $gameStore.levelIndex + 1 < LEVELS.length}
						Next Level
					{:else}
						Done!
					{/if}
				</button>
			</div>
		</div>
	</div>
{/if}

{#if $gameStore.losePopup}
	<div class="popup-backdrop">
		<div class="candy-panel popup-content lose-popup-animation">
			<h1 class="popup-title lose-title candy-text-stroke">Failed!</h1>
			<p class="popup-level-name">
				{failureReason}
			</p>

			<!-- Sad Face Icon -->
			<div class="sad-icon-container">
				<svg viewBox="0 0 80 80" width="80" height="80">
					<circle cx="40" cy="40" r="32" fill="#ef9a9a" stroke="#c62828" stroke-width="4" />
					<circle cx="28" cy="32" r="4.5" fill="#c62828" />
					<circle cx="52" cy="32" r="4.5" fill="#c62828" />
					<path d="M 28 56 Q 40 44, 52 56" fill="none" stroke="#c62828" stroke-width="4" stroke-linecap="round" />
				</svg>
			</div>

			<!-- Score achieved -->
			<div class="stats-summary">
				<div class="stat-row">
					<span class="stat-label">Your Score:</span>
					<span class="stat-val candy-text-stroke">{$gameStore.score}</span>
				</div>
				<div class="stat-row">
					<span class="stat-label">Target Score:</span>
					<span class="stat-val target-val" class:goal-complete={scoreMet}>
						{level.goal.targetScore}{scoreMet ? ' ✓' : ''}
					</span>
				</div>
				{#if $gameStore.goal.type === 'collect' && $gameStore.goal.collectColors}
					{#each $gameStore.goal.collectColors as collect}
						<div class="stat-row">
							<span class="stat-label collect-label">
								<span class="collect-dot collect-{collect.color}"></span>
								{collect.color}
							</span>
							<span
								class="stat-val target-val"
								class:goal-complete={collect.current >= collect.target}
							>
								{collect.current} / {collect.target}{collect.current >= collect.target ? ' ✓' : ''}
							</span>
						</div>
					{/each}
				{/if}
				{#if $gameStore.goal.type === 'combo' && $gameStore.goal.targetCombos !== undefined}
					<div class="stat-row">
						<span class="stat-label">Cascade:</span>
						<span
							class="stat-val target-val"
							class:goal-complete={($gameStore.goal.currentCombos || 0) >= $gameStore.goal.targetCombos}
						>
							x{$gameStore.goal.currentCombos || 1} / x{$gameStore.goal.targetCombos}
							{($gameStore.goal.currentCombos || 0) >= $gameStore.goal.targetCombos ? ' ✓' : ''}
						</span>
					</div>
				{/if}
			</div>

			<!-- Extra Moves Shop Option -->
			<div class="buy-extra-container">
				{#if level.type === 'time'}
					<button
						class="buy-extra-btn"
						disabled={$gameStore.coins < 50}
						onclick={gameStore.buyExtraTime}
					>
						<span>Get +15 Seconds</span>
						<span class="buy-price">🪙 50 Coins</span>
					</button>
				{:else}
					<button
						class="buy-extra-btn"
						disabled={$gameStore.coins < 50}
						onclick={gameStore.buyExtraMoves}
					>
						<span>Get +5 Moves</span>
						<span class="buy-price">🪙 50 Coins</span>
					</button>
				{/if}
			</div>

			<!-- Action Buttons -->
			<div class="popup-actions">
				<button class="candy-btn candy-btn-blue" onclick={handleBackToMap}>
					Map
				</button>
				<button class="candy-btn candy-btn-pink" onclick={handleRetry}>
					Retry
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.popup-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.65);
		backdrop-filter: blur(4px);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}

	.popup-content {
		width: 90%;
		max-width: 400px;
		padding: 24px 20px;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.popup-title {
		font-size: 3rem;
		font-weight: 700;
		margin: 0;
	}

	.win-title {
		color: #ffeb3b;
		-webkit-text-stroke: 1.5px #d84315;
		text-shadow: 0 4px 0 #d84315;
	}

	.lose-title {
		color: #ef9a9a;
		-webkit-text-stroke: 1.5px #b71c1c;
		text-shadow: 0 4px 0 #b71c1c;
	}

	.popup-level-name {
		font-size: 1.1rem;
		font-weight: 700;
		color: #5d3f2c;
		margin-top: -8px;
	}

	/* Stars Display */
	.stars-container {
		display: flex;
		justify-content: center;
		gap: 14px;
		margin: 8px 0;
		height: 60px;
		width: 100%;
	}

	.big-star {
		font-size: 3.5rem;
		color: #e0e0e0;
		text-shadow: 0 2px 4px rgba(0,0,0,0.15);
		transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		transform: scale(0.9);
	}

	.big-star.active {
		color: #ffd54f;
		text-shadow: 0 3px 6px rgba(230, 81, 0, 0.5), 0 0 10px #ffd54f;
		transform: scale(1.15) rotate(15deg);
	}

	.star-1 { transition-delay: 0.1s; }
	.star-2 { transition-delay: 0.3s; }
	.star-3 { transition-delay: 0.5s; }

	/* Sad Icon */
	.sad-icon-container {
		margin: 8px 0;
		animation: float-lose 2s ease-in-out infinite;
	}

	@keyframes float-lose {
		0%, 100% { transform: translateY(0) rotate(0); }
		50% { transform: translateY(-5px) rotate(-3deg); }
	}

	/* Stats Summary */
	.stats-summary {
		width: 100%;
		background: #fff;
		border: 3px solid #ffcde4;
		border-radius: 16px;
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
	}

	.stat-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 1rem;
		font-weight: 700;
	}

	.stat-label {
		color: #795548;
	}

	.stat-val {
		color: #fff;
		font-size: 1.3rem;
		-webkit-text-stroke: 1px #5d3f2c;
	}

	.reward-coins {
		color: #f57f17;
		-webkit-text-stroke: 0px;
		font-size: 1.15rem;
	}

	.target-val {
		color: #d84315;
	}

	.goal-complete {
		color: #2e7d32;
	}

	.collect-label {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		text-transform: capitalize;
	}

	.collect-dot {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid rgba(80, 23, 0, 0.26);
		box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.7);
	}

	.collect-red { background: #ff5c8a; }
	.collect-orange { background: #ffaa3b; }
	.collect-yellow { background: #ffea6c; }
	.collect-green { background: #7ee57b; }
	.collect-blue { background: #4fc3f7; }
	.collect-purple { background: #e040fb; }

	/* Buy Extra Moves/Time */
	.buy-extra-container {
		width: 100%;
		margin: 4px 0;
	}

	.buy-extra-btn {
		width: 100%;
		background: linear-gradient(to bottom, #ffeb3b 0%, #fbc02d 100%);
		border: 3.5px solid #fff;
		border-radius: 50px;
		padding: 10px 16px;
		font-family: 'Fredoka', sans-serif;
		font-weight: 700;
		font-size: 1.15rem;
		color: #e65100;
		text-shadow: 0 1px 0 rgba(255,255,255,0.4);
		box-shadow: 0 5px 0 #f57f17, 0 6px 8px rgba(0,0,0,0.15);
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		transition: all 0.1s ease;
	}

	.buy-extra-btn:active:not(:disabled) {
		transform: translateY(3px);
		box-shadow: 0 2px 0 #f57f17, 0 3px 5px rgba(0,0,0,0.15);
	}

	.buy-extra-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		filter: grayscale(0.5);
	}

	.buy-price {
		font-size: 0.95rem;
		background: rgba(255,255,255,0.5);
		padding: 2px 8px;
		border-radius: 12px;
	}

	/* Popups transitions animations */
	.popup-actions {
		display: flex;
		gap: 12px;
		width: 100%;
		justify-content: center;
		margin-top: 8px;
	}

	.win-popup-animation {
		animation: pop-win 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}

	.lose-popup-animation {
		animation: pop-win 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}

	@keyframes pop-win {
		0% {
			transform: scale(0.6) translateY(50px);
			opacity: 0;
		}
		100% {
			transform: scale(1) translateY(0);
			opacity: 1;
		}
	}
</style>
