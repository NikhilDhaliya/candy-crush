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
									<Candy color={collect.color} type="standard" size={28} />
								</div>
								<span class="goal-qty" class:qty-done={collect.current >= collect.target}>
									{collect.current} / {collect.target}
								</span>
							</div>
						{/each}
					{/if}

					<!-- Combo Goal -->
					{#if $gameStore.goal.type === 'combo' && $gameStore.goal.targetCombos !== undefined}
						<div class="goal-item-combo">
							<span class="target-desc">Cascade:</span>
							<span class="goal-qty" class:qty-done={$gameStore.goal.currentCombos! >= $gameStore.goal.targetCombos!}>
								Combo x{$gameStore.goal.currentCombos || 1} / x{level.goal.targetCombos}
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

	<!-- In-game Booster panel -->
	<div class="booster-panel">
		<span class="booster-panel-title">BOOSTERS</span>
		<div class="booster-buttons">
			<!-- Hammer -->
			<button
				class="booster-btn"
				class:active={$gameStore.selectedBooster === 'hammer'}
				disabled={$gameStore.boostersCount.hammer <= 0 || $gameStore.locked}
				onclick={() => gameStore.selectBooster('hammer')}
			>
				<span class="booster-icon">🔨</span>
				<div class="booster-label-container">
					<span class="booster-name">Hammer</span>
					<span class="booster-count">x{$gameStore.boostersCount.hammer}</span>
				</div>
			</button>

			<!-- Shuffle -->
			<button
				class="booster-btn"
				class:active={$gameStore.selectedBooster === 'shuffle'}
				disabled={$gameStore.boostersCount.shuffle <= 0 || $gameStore.locked}
				onclick={() => gameStore.selectBooster('shuffle')}
			>
				<span class="booster-icon">🔀</span>
				<div class="booster-label-container">
					<span class="booster-name">Shuffle</span>
					<span class="booster-count">x{$gameStore.boostersCount.shuffle}</span>
				</div>
			</button>

			<!-- Row Blast -->
			<button
				class="booster-btn"
				class:active={$gameStore.selectedBooster === 'row_blast'}
				disabled={$gameStore.boostersCount.row_blast <= 0 || $gameStore.locked}
				onclick={() => gameStore.selectBooster('row_blast')}
			>
				<span class="booster-icon">🚀</span>
				<div class="booster-label-container">
					<span class="booster-name">Row Blast</span>
					<span class="booster-count">x{$gameStore.boostersCount.row_blast}</span>
				</div>
			</button>
		</div>
		{#if $gameStore.selectedBooster}
			<p class="booster-instruction">
				Select a tile on the board to apply <strong>{$gameStore.selectedBooster}</strong>!
			</p>
		{/if}
	</div>
</div>

<style>
	.hud-container {
		width: 100%;
		max-width: 480px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin: 0 auto 12px auto;
	}

	.hud-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
	}

	.hud-back-btn {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: #d93d8b;
		border: 3px solid #fff;
		box-shadow: 0 4px 0 #b71c1c;
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
	}

	.level-title {
		font-size: 1.8rem;
		font-weight: 700;
	}

	.level-subtitle {
		font-size: 0.9rem;
		color: #5d3f2c;
		font-weight: 600;
	}

	.score-display {
		min-width: 120px;
	}

	.score-bubble {
		background: #ffffff;
		border: 3px solid #f772b1;
		border-radius: 16px;
		padding: 4px 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: inset 0 2px 4px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
	}

	.score-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #f772b1;
	}

	.score-value {
		font-size: 1.4rem;
		font-weight: 700;
		color: #fff;
		-webkit-text-stroke: 1px #5d3f2c;
	}

	.hud-stats-row {
		display: flex;
		gap: 12px;
	}

	.shadow-box {
		flex: 1;
		background: rgba(255, 255, 255, 0.9);
		border: 4px solid #f772b1;
		border-radius: 18px;
		padding: 10px;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 6px 0 #d93d8b, 0 8px 10px rgba(0,0,0,0.1);
	}

	.limit-box {
		justify-content: center;
	}

	.limit-label {
		font-size: 0.8rem;
		font-weight: 700;
		color: #5d3f2c;
	}

	.limit-value {
		font-size: 2.2rem;
		font-weight: 700;
		color: #d93d8b;
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
		font-size: 0.8rem;
		font-weight: 700;
		color: #5d3f2c;
		margin-bottom: 6px;
	}

	.goals-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
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
		font-size: 0.9rem;
		font-weight: 600;
		color: #5d3f2c;
	}

	.target-score {
		font-size: 1.4rem;
		font-weight: 700;
		color: #fff;
		-webkit-text-stroke: 1px #5d3f2c;
	}

	.goal-item-collect {
		display: flex;
		align-items: center;
		gap: 4px;
		background: #fff;
		border: 2px solid #ffdceb;
		padding: 2px 6px;
		border-radius: 10px;
	}

	.goal-icon {
		display: flex;
		align-items: center;
	}

	.goal-qty {
		font-size: 0.95rem;
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
		padding: 8px 12px;
		background: rgba(255, 255, 255, 0.7);
		border-radius: 14px;
		border: 2px solid rgba(255, 255, 255, 0.9);
	}

	.progress-bar-track {
		height: 20px;
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
		top: -4px;
		width: 28px;
		height: 28px;
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

	/* In-game Booster Panel */
	.booster-panel {
		background: rgba(255, 255, 255, 0.8);
		border: 3px solid #ffd54f;
		border-radius: 18px;
		padding: 8px 12px;
		margin-top: 4px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}

	.booster-panel-title {
		font-size: 0.8rem;
		font-weight: 700;
		color: #5d3f2c;
		letter-spacing: 0.5px;
	}

	.booster-buttons {
		display: flex;
		gap: 12px;
		justify-content: center;
		width: 100%;
	}

	.booster-btn {
		flex: 1;
		max-width: 110px;
		padding: 6px;
		background: linear-gradient(to bottom, #fff 0%, #f5f5f5 100%);
		border: 3px solid #ccc;
		border-radius: 12px;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 6px;
		transition: all 0.1s ease;
		box-shadow: 0 3px 0 #bbb;
	}

	.booster-btn:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: 0 1px 0 #bbb;
	}

	.booster-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.booster-btn.active {
		border-color: #ffd54f;
		background: linear-gradient(to bottom, #fffde7 0%, #fff59d 100%);
		box-shadow: 0 3px 0 #fbc02d, 0 0 8px #ffd54f;
		transform: scale(1.05);
	}

	.booster-icon {
		font-size: 1.4rem;
	}

	.booster-label-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.booster-name {
		font-size: 0.75rem;
		font-weight: 700;
		color: #5d3f2c;
	}

	.booster-count {
		font-size: 0.7rem;
		font-weight: 600;
		color: #888;
	}

	.booster-instruction {
		font-size: 0.75rem;
		color: #ef6c00;
		font-weight: 600;
	}
</style>
