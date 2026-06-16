<script lang="ts">
	import { gameStore } from '../stores/gameStore';
</script>

<div class="booster-panel">
	<span class="booster-panel-title">BOOSTERS</span>
	<div class="booster-buttons">
		<!-- Hammer -->
		<button
			class="booster-btn"
			class:active={$gameStore.selectedBooster === 'hammer'}
			disabled={$gameStore.boostersCount.hammer <= 0 || $gameStore.locked}
			onclick={() => gameStore.selectBooster('hammer')}
			title="Hammer - Destroy any single candy"
		>
			<span class="booster-icon">🔨</span>
			<span class="booster-badge">{$gameStore.boostersCount.hammer}</span>
		</button>

		<!-- Shuffle -->
		<button
			class="booster-btn"
			class:active={$gameStore.selectedBooster === 'shuffle'}
			disabled={$gameStore.boostersCount.shuffle <= 0 || $gameStore.locked}
			onclick={() => gameStore.selectBooster('shuffle')}
			title="Shuffle - Rearrange all candy tiles"
		>
			<span class="booster-icon">🔀</span>
			<span class="booster-badge">{$gameStore.boostersCount.shuffle}</span>
		</button>

		<!-- Row Blast -->
		<button
			class="booster-btn"
			class:active={$gameStore.selectedBooster === 'row_blast'}
			disabled={$gameStore.boostersCount.row_blast <= 0 || $gameStore.locked}
			onclick={() => gameStore.selectBooster('row_blast')}
			title="Row Blast - Clear a horizontal row"
		>
			<span class="booster-icon">🚀</span>
			<span class="booster-badge">{$gameStore.boostersCount.row_blast}</span>
		</button>
	</div>
	{#if $gameStore.selectedBooster}
		<p class="booster-instruction">
			Select a tile on the board to apply <strong>{$gameStore.selectedBooster}</strong>!
		</p>
	{/if}
</div>

<style>
	.booster-panel {
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 246, 218, 0.82));
		backdrop-filter: blur(12px);
		border: 2px solid rgba(255, 229, 138, 0.95);
		border-radius: 18px;
		padding: clamp(6px, 1.1dvh, 9px) 12px;
		margin: 0 auto;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		width: 100%;
		max-width: var(--board-size, 480px);
		box-shadow: 0 5px 0 rgba(198, 118, 32, 0.65), 0 10px 20px rgba(80, 23, 0, 0.14);
		z-index: 5;
		flex-shrink: 0;
	}

	.booster-panel-title {
		font-size: clamp(0.62rem, 2.2vw, 0.75rem);
		font-weight: 700;
		color: #6f3a12;
		letter-spacing: 0.5px;
		white-space: nowrap;
	}

	.booster-buttons {
		display: flex;
		gap: clamp(8px, 3vw, 16px);
		justify-content: flex-end;
		width: auto;
	}

	.booster-btn {
		width: clamp(42px, 11vw, 54px);
		height: clamp(42px, 11vw, 54px);
		border-radius: 50%;
		background: linear-gradient(to bottom, #fff 0%, #fff3c4 100%);
		border: 3px solid #fff;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative;
		transition: all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		box-shadow: 0 4px 0 #d99a25, 0 5px 10px rgba(80, 23, 0, 0.18);
	}

	.booster-btn:active:not(:disabled) {
		transform: translateY(2px);
		box-shadow: 0 2px 0 #bbb, 0 2px 4px rgba(0,0,0,0.15);
	}

	.booster-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		box-shadow: none;
	}

	.booster-btn.active {
		border-color: #ffd54f;
		background: linear-gradient(to bottom, #fff 0%, #ffe066 100%);
		box-shadow: 0 4px 0 #f08a00, 0 0 14px rgba(255, 213, 79, 0.95);
		transform: scale(1.1);
	}

	.booster-icon {
		font-size: clamp(1.22rem, 5.5vw, 1.7rem);
		transform: translateY(-1px);
	}

	.booster-badge {
		position: absolute;
		bottom: -2px;
		right: -4px;
		background: #ff2c68;
		color: white;
		font-size: clamp(0.62rem, 2.4vw, 0.75rem);
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 10px;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0,0,0,0.2);
	}

	.booster-instruction {
		position: absolute;
		bottom: calc(100% + 6px);
		left: 50%;
		transform: translateX(-50%);
		width: min(92vw, var(--board-size, 480px));
		background: rgba(255, 255, 255, 0.9);
		border: 2px solid #ffd54f;
		border-radius: 999px;
		padding: 4px 10px;
		text-align: center;
		font-size: 0.75rem;
		color: #ef6c00;
		font-weight: 600;
		box-shadow: 0 4px 12px rgba(80, 23, 0, 0.16);
	}

	/* Height-based responsive rules for short viewports */
	@media (max-height: 760px) {
		.booster-panel {
			padding-block: 5px;
		}
		.booster-badge {
			font-size: 0.65rem;
			padding: 1px 4px;
		}
	}

	@media (max-height: 640px) {
		.booster-panel {
			padding-block: 4px;
			border-radius: 15px;
			gap: 6px;
		}
	}

	@media (max-width: 360px) {
		.booster-panel-title {
			display: none;
		}

		.booster-buttons {
			width: 100%;
			justify-content: space-around;
		}
	}
</style>
