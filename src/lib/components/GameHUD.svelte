<script lang="ts">
	import { gameStore, LEVELS } from '../stores/gameStore';
	import Candy from './Candy.svelte';

	const level = $derived(LEVELS[$gameStore.levelIndex]);

	// Format time from seconds to MM:SS
	const formattedTime = $derived.by(() => {
		const m = Math.floor($gameStore.timeLeft / 60);
		const s = $gameStore.timeLeft % 60;
		return `${m}:${s < 10 ? '0' : ''}${s}`;
	});

	// Score progress percent for the progress bar
	const progressPercent = $derived.by(() => {
		const maxThreshold = level.starThresholds[2];
		return Math.min(100, ($gameStore.score / maxThreshold) * 100);
	});

	// Check if star thresholds are reached
	const star1Reached = $derived($gameStore.score >= level.starThresholds[0]);
	const star2Reached = $derived($gameStore.score >= level.starThresholds[1]);
	const star3Reached = $derived($gameStore.score >= level.starThresholds[2]);

	// Translate coordinates on the progress bar for star nodes
	const star1Left = $derived((level.starThresholds[0] / level.starThresholds[2]) * 100);
	const star2Left = $derived((level.starThresholds[1] / level.starThresholds[2]) * 100);
	const star3Left = 100;
</script>

<div class="hud-container">
	<!-- Top Bar: Level Name & Score -->
	<div class="hud-header">
		<button class="hud-back-btn" aria-label="Back to map" onclick={() => gameStore.setScreen('map')}>
			<svg viewBox="0 0 24 24" width="24" height="24">
				<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="#fff" />
			</svg>
		</button>
		<div class="level-info">
			<h2 class="level-title candy-text-stroke">Level {level.id}</h2>
			<p class="level-subtitle">{level.name}</p>
		</div>
		<div class="score-display">
			<div class="score-bubble">
				<span class="score-label">SCORE</span>
				<span class="score-value candy-text-stroke">{$gameStore.score}</span>
			</div>
		</div>
	</div>

	<!-- Objectives & Limits Row -->
	<div class="hud-stats-row">
		<!-- Limit (Moves or Time) -->
		<div class="limit-box shadow-box">
			{#if level.type === 'time'}
				<span class="limit-label">TIME</span>
				<span class="limit-value" class:low-time={$gameStore.timeLeft < 10}>{formattedTime}</span>
			{:else}
				<span class="limit-label">MOVES</span>
				<span class="limit-value">{$gameStore.movesLeft}</span>
			{/if}
		</div>

		<!-- Objectives Display -->
		<div class="objectives-box shadow-box">
			<span class="section-label">OBJECTIVES</span>
			<div class="goals-list">
				{#if $gameStore.goal.type === 'score'}
					<div class="goal-item-score">
						<span class="target-desc">Target:</span>
						<span class="target-score candy-text-stroke">{level.goal.targetScore}</span>
					</div>
				{:else}
					<!-- Collection Goals -->
					{#if $gameStore.goal.type === 'collect' && $gameStore.goal.collectColors}
						{#each $gameStore.goal.collectColors as collect}
							<div class="goal-item-collect">
								<div class="goal-icon">
									<Candy color={collect.color} type="standard" size={26} />
								</div>
								<span class="goal-qty" class:qty-done={collect.current >= collect.target}>
									{collect.current}/{collect.target}
								</span>
							</div>
						{/each}
					{/if}

					<!-- Combo Goal -->
					{#if $gameStore.goal.type === 'combo' && $gameStore.goal.targetCombos !== undefined}
						<div class="goal-item-combo">
							<span class="target-desc">Cascade:</span>
							<span class="goal-qty" class:qty-done={$gameStore.goal.currentCombos! >= $gameStore.goal.targetCombos!}>
								Combo x{$gameStore.goal.currentCombos || 1}/x{level.goal.targetCombos}
							</span>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>

	<!-- Score Progress Bar with Star Milestones -->
	<div class="progress-bar-container">
		<div class="progress-bar-track">
			<div class="progress-bar-fill" style="width: {progressPercent}%"></div>

			<!-- Star Nodes -->
			<div
				class="star-node"
				class:star-active={star1Reached}
				style="left: {star1Left}%;"
				title="1 Star"
			>
				★
			</div>
			<div
				class="star-node"
				class:star-active={star2Reached}
				style="left: {star2Left}%;"
				title="2 Stars"
			>
				★
			</div>
			<div
				class="star-node"
				class:star-active={star3Reached}
				style="left: {star3Left}%; transform: translateX(-100%);"
				title="3 Stars"
			>
				★
			</div>
		</div>
	</div>
</div>

<style>
	.hud-container {
		width: 100%;
		max-width: var(--board-size, 480px);
		display: flex;
		flex-direction: column;
		gap: clamp(5px, 1dvh, 10px);
		margin: 0 auto;
		flex-shrink: 0;
	}

	.hud-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.hud-back-btn {
		width: clamp(34px, 8.8vw, 42px);
		height: clamp(34px, 8.8vw, 42px);
		border-radius: 50%;
		background: linear-gradient(180deg, #ff6aa7 0%, #d82c76 100%);
		border: 3px solid #fff;
		box-shadow: 0 4px 0 #97234d, 0 6px 12px rgba(80, 23, 0, 0.2);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}
	.hud-back-btn:active {
		transform: translateY(2px);
		box-shadow: 0 2px 0 #b71c1c;
	}

	.level-info {
		flex-grow: 1;
		min-width: 0;
	}

	.level-title {
		font-size: clamp(1.22rem, 5.8vw, 1.8rem);
		font-weight: 700;
		line-height: 0.92;
	}

	.level-subtitle {
		font-size: clamp(0.72rem, 2.8vw, 0.9rem);
		color: #613315;
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.score-display {
		min-width: clamp(92px, 27vw, 122px);
	}

	.score-bubble {
		background: linear-gradient(180deg, #fff 0%, #fff5fb 100%);
		border: 3px solid #ff70ad;
		border-radius: 14px;
		padding: 3px 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
	}

	.score-label {
		font-size: clamp(0.58rem, 2.3vw, 0.72rem);
		font-weight: 700;
		color: #d82c76;
	}

	.score-value {
		font-size: clamp(1rem, 4.5vw, 1.35rem);
		font-weight: 700;
		color: #fff;
		-webkit-text-stroke: 1px #5d3f2c;
	}

	.hud-stats-row {
		display: flex;
		gap: clamp(6px, 2vw, 10px);
	}

	.shadow-box {
		flex: 1;
		min-width: 0;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 245, 251, 0.92));
		border: 3px solid #ff70ad;
		border-radius: 14px;
		padding: clamp(5px, 1.4dvh, 8px);
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 4px 0 #d82c76, 0 7px 12px rgba(80, 23, 0, 0.12);
	}

	.limit-box {
		justify-content: center;
	}

	.limit-label {
		font-size: clamp(0.58rem, 2.2vw, 0.75rem);
		font-weight: 700;
		color: #5d3f2c;
	}

	.limit-value {
		font-size: clamp(1.35rem, 7vw, 2rem);
		font-weight: 700;
		color: #d82c76;
		line-height: 0.95;
	}

	.low-time {
		color: #d32f2f;
		animation: blink 0.5s infinite alternate;
	}

	@keyframes blink {
		from { opacity: 1; }
		to { opacity: 0.4; }
	}

	.section-label {
		font-size: clamp(0.58rem, 2.2vw, 0.75rem);
		font-weight: 700;
		color: #5d3f2c;
		margin-bottom: 4px;
	}

	.goals-list {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
	}

	.goal-item-score {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.target-desc {
		font-size: clamp(0.68rem, 2.5vw, 0.82rem);
		font-weight: 600;
		color: #5d3f2c;
	}

	.target-score {
		font-size: clamp(1rem, 4.2vw, 1.28rem);
		font-weight: 700;
		color: #fff;
		-webkit-text-stroke: 1px #5d3f2c;
	}

	.goal-item-collect {
		display: flex;
		align-items: center;
		gap: 4px;
		background: #fff;
		border: 2px solid #ffc2dc;
		padding: 1px 5px;
		border-radius: 10px;
	}

	.goal-icon {
		display: flex;
		align-items: center;
	}

	.goal-qty {
		font-size: clamp(0.72rem, 2.8vw, 0.9rem);
		font-weight: 700;
		color: #5d3f2c;
	}

	.qty-done {
		color: #388e3c;
		text-decoration: line-through;
	}

	.goal-item-combo {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Progress Bar */
	.progress-bar-container {
		width: 100%;
		padding: 5px 10px;
		background: rgba(255, 255, 255, 0.58);
		border-radius: 12px;
		border: 2px solid rgba(255, 255, 255, 0.9);
	}

	.progress-bar-track {
		height: clamp(12px, 2.7dvh, 18px);
		width: 100%;
		background: #e0e0e0;
		border-radius: 10px;
		position: relative;
		box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
	}

	.progress-bar-fill {
		height: 100%;
		background: repeating-linear-gradient(
			45deg,
			#ffd54f,
			#ffd54f 10px,
			#ffca28 10px,
			#ffca28 20px
		);
		border-radius: 10px;
		transition: width 0.3s ease;
		box-shadow: inset 0 -2px 4px rgba(0,0,0,0.1);
	}

	.star-node {
		position: absolute;
		top: -5px;
		width: clamp(20px, 5.6vw, 27px);
		height: clamp(20px, 5.6vw, 27px);
		background: #fff;
		border: 3px solid #bdbdbd;
		border-radius: 50%;
		color: #bdbdbd;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 0.9rem;
		font-weight: 700;
		transform: translateX(-50%);
		box-shadow: 0 2px 4px rgba(0,0,0,0.2);
	}

	.star-active {
		border-color: #ffd54f;
		background: #ffd54f;
		color: #fff;
		text-shadow: 0 1px 2px rgba(0,0,0,0.4);
		animation: star-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}

	@keyframes star-pop {
		0% { transform: scale(1) translateX(-50%); }
		50% { transform: scale(1.3) translateX(-40%); }
		100% { transform: scale(1.15) translateX(-43%); }
	}

	/* Responsive scaling rules for mobile screens */
	@media (max-height: 760px) {
		.hud-container {
			gap: 5px;
		}
		.shadow-box {
			border-width: 2px;
			box-shadow: 0 4px 0 #d93d8b, 0 6px 8px rgba(0,0,0,0.1);
		}
		.progress-bar-container {
			padding: 3px 8px;
		}
	}

	@media (max-height: 640px) {
		.hud-container {
			gap: 3px;
		}
		.shadow-box {
			padding-block: 3px;
		}
	}

	@media (max-width: 420px) {
		.level-subtitle {
			max-width: 35vw;
		}

		.progress-bar-container {
			padding-inline: 8px;
		}
	}
</style>
