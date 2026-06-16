<script lang="ts">
	import { onMount } from 'svelte';
	import { gameStore, LEVELS } from '../stores/gameStore';

	let mapContainer = $state<HTMLDivElement | null>(null);
	let dailyRewardClaimed = $state(false);

	// Custom coordinates for 20 level nodes
	// left: % width of the container
	// bottom: px offset from bottom of map
	const nodePositions = [
		{ left: 35, bottom: 60 },   // Level 1
		{ left: 55, bottom: 160 },  // Level 2
		{ left: 75, bottom: 260 },  // Level 3
		{ left: 60, bottom: 360 },  // Level 4
		{ left: 35, bottom: 460 },  // Level 5
		{ left: 15, bottom: 560 },  // Level 6
		{ left: 25, bottom: 660 },  // Level 7
		{ left: 50, bottom: 760 },  // Level 8
		{ left: 70, bottom: 860 },  // Level 9
		{ left: 60, bottom: 960 },  // Level 10
		{ left: 35, bottom: 1060 }, // Level 11
		{ left: 15, bottom: 1160 }, // Level 12
		{ left: 20, bottom: 1260 }, // Level 13
		{ left: 45, bottom: 1360 }, // Level 14
		{ left: 70, bottom: 1460 }, // Level 15
		{ left: 65, bottom: 1560 }, // Level 16
		{ left: 40, bottom: 1660 }, // Level 17
		{ left: 20, bottom: 1760 }, // Level 18
		{ left: 35, bottom: 1860 }, // Level 19
		{ left: 55, bottom: 1980 }  // Level 20
	];

	// Scroll to bottom (Level 1) on mount
	onMount(() => {
		if (mapContainer) {
			mapContainer.scrollTop = mapContainer.scrollHeight;
		}
	});

	function handleSelectLevel(index: number) {
		const progress = $gameStore.levelsProgress[index];
		if (progress && progress.unlocked) {
			gameStore.startGame(index);
		}
	}

	function handleClaimDaily() {
		if (dailyRewardClaimed) return;
		dailyRewardClaimed = true;
		gameStore.claimDailyCoins();
	}
</script>

<div class="map-screen-wrapper">
	<!-- Top Map HUD -->
	<div class="map-hud">
		<button class="map-home-btn" onclick={() => gameStore.setScreen('menu')}>
			🏠
		</button>
		<div class="coin-badge shadow-box-map">
			<span class="coin-icon">🪙</span>
			<span class="coin-count">{$gameStore.coins}</span>
		</div>
		<div class="map-settings-buttons">
			<!-- Sound Toggle -->
			<button class="map-settings-btn" onclick={gameStore.toggleSound}>
				{$gameStore.soundOn ? '🔊' : '🔇'}
			</button>
			<!-- Music Toggle -->
			<button class="map-settings-btn" onclick={gameStore.toggleMusic}>
				{$gameStore.musicOn ? '🎵' : '🔕'}
			</button>
			<!-- Colorblind Toggle -->
			<button
				class="map-settings-btn colorblind-btn"
				class:active={$gameStore.colorBlindMode}
				onclick={gameStore.toggleColorBlind}
				title="Toggle Colorblind Assistance"
			>
				👁️
			</button>
		</div>
	</div>

	<!-- Scrollable Candy Path -->
	<div class="scroll-container" bind:this={mapContainer}>
		<div class="path-scroller" style="height: 2150px;">
			<!-- Winding Path SVG Line -->
			<svg class="path-svg" viewBox="0 0 100 2150" preserveAspectRatio="none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<path
					d="
						M 35 2090 
						Q 45 2040, 55 1990
						T 75 1890
						T 60 1790
						T 35 1690
						T 15 1590
						T 25 1490
						T 50 1390
						T 70 1290
						T 60 1190
						T 35 1090
						T 15 990
						T 20 890
						T 45 790
						T 70 690
						T 65 590
						T 40 490
						T 20 390
						T 35 290
						T 55 170
					"
					fill="none"
					stroke="#ffeb3b"
					stroke-width="12"
					stroke-linecap="round"
					stroke-dasharray="8 8"
					opacity="0.9"
					vector-effect="non-scaling-stroke"
				/>
				<!-- Outer path shadow line -->
				<path
					d="
						M 35 2090 
						Q 45 2040, 55 1990
						T 75 1890
						T 60 1790
						T 35 1690
						T 15 1590
						T 25 1490
						T 50 1390
						T 70 1290
						T 60 1190
						T 35 1090
						T 15 990
						T 20 890
						T 45 790
						T 70 690
						T 65 590
						T 40 490
						T 20 390
						T 35 290
						T 55 170
					"
					fill="none"
					stroke="#e040fb"
					stroke-width="18"
					stroke-linecap="round"
					opacity="0.3"
					style="z-index:-1"
					vector-effect="non-scaling-stroke"
				/>
			</svg>

			<!-- Chest / Daily Reward -->
			<div class="daily-chest-container" style="left: 10%; bottom: 150px;">
				<button
					class="daily-chest-btn"
					class:claimed={dailyRewardClaimed}
					onclick={handleClaimDaily}
				>
					🎁
				</button>
				<span class="daily-chest-label">Daily Gift</span>
			</div>

			<!-- Level Nodes -->
			{#each LEVELS as lvl, i}
				{@const progress = $gameStore.levelsProgress[i]}
				{@const pos = nodePositions[i]}
				
				<div
					class="level-node-container"
					style="left: {pos.left}%; bottom: {pos.bottom}px;"
				>
					<!-- Star indicators under node -->
					<div class="level-stars">
						<span class="level-star" class:filled={progress.stars >= 1}>★</span>
						<span class="level-star" class:filled={progress.stars >= 2}>★</span>
						<span class="level-star" class:filled={progress.stars >= 3}>★</span>
					</div>

					<!-- Level Button -->
					<button
						class="level-btn"
						class:locked={!progress.unlocked}
						class:active={progress.unlocked}
						disabled={!progress.unlocked}
						onclick={() => handleSelectLevel(i)}
					>
						{#if !progress.unlocked}
							🔒
						{:else}
							{lvl.id}
						{/if}
					</button>

					<!-- Hover description bubble -->
					{#if progress.unlocked}
						<div class="level-bubble-popup">
							<strong>{lvl.name}</strong>
							<p>Goal: {lvl.goal.type === 'score' ? `Score ${lvl.goal.targetScore}` : lvl.description}</p>
							{#if progress.highscore > 0}
								<small>Best: {progress.highscore}</small>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.map-screen-wrapper {
		width: 100vw;
		height: 100vh;
		max-width: 480px;
		background: radial-gradient(circle, #e8f5e9 0%, #a5d6a7 100%);
		display: flex;
		flex-direction: column;
		position: relative;
		box-shadow: 0 0 30px rgba(0,0,0,0.3);
		overflow: hidden;
	}

	/* Map Top HUD */
	.map-hud {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		background: rgba(255, 255, 255, 0.9);
		border-bottom: 4px solid #81c784;
		z-index: 10;
	}

	.map-home-btn {
		font-size: 1.5rem;
		background: #fff;
		border: 2.5px solid #81c784;
		border-radius: 50%;
		width: 40px;
		height: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		box-shadow: 0 3px 0 #388e3c;
	}
	.map-home-btn:active {
		transform: translateY(2px);
		box-shadow: 0 1px 0 #388e3c;
	}

	.coin-badge {
		background: #fff;
		border: 3px solid #ffca28;
		border-radius: 20px;
		padding: 4px 14px;
		display: flex;
		align-items: center;
		gap: 6px;
		box-shadow: 0 4px 0 #f57f17;
		font-weight: 700;
		font-size: 1.1rem;
		color: #f57f17;
	}

	.map-settings-buttons {
		display: flex;
		gap: 6px;
	}

	.map-settings-btn {
		font-size: 1.1rem;
		background: #fff;
		border: 2.5px solid #81c784;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		box-shadow: 0 3px 0 #388e3c;
	}
	.map-settings-btn:active {
		transform: translateY(2px);
		box-shadow: 0 1px 0 #388e3c;
	}

	.colorblind-btn.active {
		background: #ffeb3b;
		border-color: #fbc02d;
		box-shadow: 0 3px 0 #f57f17;
	}

	/* Scroll Path Container */
	.scroll-container {
		flex-grow: 1;
		width: 100%;
		overflow-y: scroll;
		scroll-behavior: smooth;
		padding-top: 60px; /* space for top hud */
	}

	.path-scroller {
		width: 100%;
		position: relative;
		background: repeating-linear-gradient(
			0deg,
			#a5d6a7,
			#a5d6a7 100px,
			#c8e6c9 100px,
			#c8e6c9 200px
		);
	}

	.path-svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 1;
		pointer-events: none;
	}

	/* Daily Chest */
	.daily-chest-container {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 5;
	}

	.daily-chest-btn {
		font-size: 2.2rem;
		background: none;
		border: none;
		cursor: pointer;
		animation: float 2s ease-in-out infinite;
	}
	.daily-chest-btn.claimed {
		filter: grayscale(1);
		opacity: 0.6;
		cursor: default;
		animation: none;
	}

	.daily-chest-label {
		font-size: 0.75rem;
		font-weight: 700;
		color: #fff;
		background: #ef6c00;
		padding: 2px 6px;
		border-radius: 6px;
		border: 1.5px solid #fff;
		margin-top: -4px;
	}

	/* Level Nodes */
	.level-node-container {
		position: absolute;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 5;
	}

	.level-stars {
		display: flex;
		gap: 2px;
		margin-bottom: -4px;
		z-index: 6;
	}

	.level-star {
		font-size: 0.9rem;
		color: #ccc;
		text-shadow: 0 1px 1px rgba(0,0,0,0.3);
	}

	.level-star.filled {
		color: #ffd54f;
	}

	.level-btn {
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: 4px solid #fff;
		font-family: 'Fredoka', sans-serif;
		font-weight: 700;
		font-size: 1.25rem;
		color: #fff;
		text-shadow: 0 2px 0 rgba(0,0,0,0.3);
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.1s ease;
	}

	.level-btn.active {
		background: radial-gradient(circle, #ffca28 0%, #ff8f00 100%);
		box-shadow: 0 5px 0 #e65100, 0 8px 10px rgba(0,0,0,0.15);
	}
	.level-btn.active:active {
		transform: translateY(3px);
		box-shadow: 0 2px 0 #e65100, 0 4px 6px rgba(0,0,0,0.15);
	}

	.level-btn.locked {
		background: radial-gradient(circle, #b0bec5 0%, #78909c 100%);
		box-shadow: 0 5px 0 #37474f;
		cursor: not-allowed;
	}

	/* Description Popups */
	.level-bubble-popup {
		display: none;
		position: absolute;
		bottom: 65px;
		width: 140px;
		background: #fff;
		border: 3px solid #ff8f00;
		border-radius: 12px;
		padding: 6px 10px;
		text-align: center;
		box-shadow: 0 8px 16px rgba(0,0,0,0.15);
		z-index: 10;
		font-size: 0.75rem;
		pointer-events: none;
	}
	.level-bubble-popup::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%);
		border-width: 10px 10px 0;
		border-style: solid;
		border-color: #ff8f00 transparent;
		display: block;
		width: 0;
	}

	.level-node-container:hover .level-bubble-popup {
		display: block;
	}
</style>
