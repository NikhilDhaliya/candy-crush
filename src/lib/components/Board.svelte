<script lang="ts">
	import { gameStore } from '../stores/gameStore';
	import Candy from './Candy.svelte';

	let dragStartTile = $state<{ r: number; c: number } | null>(null);
	let dragStartPos = $state<{ x: number; y: number } | null>(null);
	let dragOffset = $state({ x: 0, y: 0 });
	let isDragging = $state(false);

	// Convert 2D board to flat list for rendering with Svelte keyed lists
	let flatCandies = $derived.by(() => {
		const list: { r: number; c: number; key: string; candy: any }[] = [];
		const board = $gameStore.board;
		for (let r = 0; r < board.length; r++) {
			for (let c = 0; c < board[r].length; c++) {
				const candy = board[r][c];
				if (candy) {
					list.push({
						r,
						c,
						key: `${r},${c}`,
						candy
					});
				}
			}
		}
		return list;
	});

	let fxKeys = $derived(new Set($gameStore.boardFx.keys || []));
	let spawnedIds = $derived(new Set(($gameStore.boardFx.spawns || []).map((spawn) => spawn.candyId)));
	let fallingIds = $derived(new Map(($gameStore.boardFx.fallTransitions || []).map((fall) => [
		fall.candyId,
		fall
	])));

	let fxParticles = $derived.by(() => {
		const keys = $gameStore.boardFx.keys || [];
		return keys.flatMap((key, index) => {
			const [r, c] = key.split(',').map(Number);
			return Array.from({ length: 5 }, (_, burstIndex) => ({
				id: `${$gameStore.boardFx.id}-${key}-${burstIndex}`,
				r,
				c,
				delay: `${(index % 4) * 12 + burstIndex * 18}ms`,
				angle: `${burstIndex * 72 + index * 17}deg`
			}));
		});
	});

	let blastRows = $derived.by(() => {
		if ($gameStore.boardFx.kind !== 'booster') return [];
		const keys = $gameStore.boardFx.keys || [];
		return Array.from({ length: 8 }, (_, r) => r).filter((r) =>
			keys.filter((key) => key.startsWith(`${r},`)).length >= 6
		);
	});

	let blastCols = $derived.by(() => {
		if ($gameStore.boardFx.kind !== 'booster') return [];
		const keys = $gameStore.boardFx.keys || [];
		return Array.from({ length: 8 }, (_, c) => c).filter((c) =>
			keys.filter((key) => key.endsWith(`,${c}`)).length >= 6
		);
	});

	let floatingScore = $derived.by(() => {
		const fx = $gameStore.boardFx;
		if (!fx.scoreDelta || !fx.origin || fx.kind === 'idle') return null;
		return {
			id: fx.id,
			text: `+${fx.scoreDelta}`,
			r: fx.origin.r,
			c: fx.origin.c,
			combo: fx.combo || 1
		};
	});

	function wrapperStyle(r: number, c: number, candyId: string) {
		const style = [`top: ${r * 12.5}%; left: ${c * 12.5}%;`];
		const invalid = $gameStore.boardFx.kind === 'invalid' ? $gameStore.boardFx.swap : undefined;
		const fall = fallingIds.get(candyId);
		const isDragged = isDragging && dragStartTile?.r === r && dragStartTile?.c === c;

		if (invalid) {
			if (r === invalid.r1 && c === invalid.c1) {
				style.push(`--swap-x: ${(invalid.c2 - invalid.c1) * 68}%; --swap-y: ${(invalid.r2 - invalid.r1) * 68}%;`);
			} else if (r === invalid.r2 && c === invalid.c2) {
				style.push(`--swap-x: ${(invalid.c1 - invalid.c2) * 68}%; --swap-y: ${(invalid.r1 - invalid.r2) * 68}%;`);
			}
		}

		if (fall) {
			style.push(`--fall-from: ${(fall.fromR - fall.toR) * 100}%;`);
		}

		if (spawnedIds.has(candyId)) {
			style.push(`--fall-from: -${(r + 2) * 100}%;`);
		}

		if (isDragged) {
			style.push(`--drag-x: ${dragOffset.x}px; --drag-y: ${dragOffset.y}px;`);
		}

		return style.join(' ');
	}

	function isInvalidParticipant(r: number, c: number) {
		const swap = $gameStore.boardFx.kind === 'invalid' ? $gameStore.boardFx.swap : undefined;
		return !!swap && ((r === swap.r1 && c === swap.c1) || (r === swap.r2 && c === swap.c2));
	}

	// Input Handlers
	function handleStart(e: MouseEvent | TouchEvent, r: number, c: number) {
		if ($gameStore.locked) return;

		// If a booster is active, apply it instead of dragging
		if ($gameStore.selectedBooster) {
			gameStore.applyBooster(r, c);
			return;
		}

		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

		dragStartTile = { r, c };
		dragStartPos = { x: clientX, y: clientY };
		dragOffset = { x: 0, y: 0 };
		isDragging = true;
	}

	function handleMove(e: MouseEvent | TouchEvent) {
		if (!isDragging || !dragStartTile || !dragStartPos || $gameStore.locked) return;
		e.preventDefault();

		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

		const dx = clientX - dragStartPos.x;
		const dy = clientY - dragStartPos.y;
		const threshold = 35; // px
		dragOffset = {
			x: Math.max(-28, Math.min(28, dx * 0.34)),
			y: Math.max(-28, Math.min(28, dy * 0.34))
		};

		if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
			isDragging = false;
			dragOffset = { x: 0, y: 0 };
			const { r, c } = dragStartTile;

			let targetR = r;
			let targetC = c;

			if (Math.abs(dx) > Math.abs(dy)) {
				// Horizontal Swap
				targetC = dx > 0 ? c + 1 : c - 1;
			} else {
				// Vertical Swap
				targetR = dy > 0 ? r + 1 : r - 1;
			}

			// Validate bounds before calling store swap
			if (targetR >= 0 && targetR < 8 && targetC >= 0 && targetC < 8) {
				gameStore.makeSwapMove(r, c, targetR, targetC);
			}

			dragStartTile = null;
			dragStartPos = null;
		}
	}

	function handleEnd() {
		isDragging = false;
		dragStartTile = null;
		dragStartPos = null;
		dragOffset = { x: 0, y: 0 };
	}
</script>

<div
	class="board-outer-container"
	class:shake={$gameStore.boardFx.kind === 'booster'}
	class:shuffle-board={$gameStore.boardFx.kind === 'shuffle'}
	onmousemove={handleMove}
	onmouseup={handleEnd}
	onmouseleave={handleEnd}
	ontouchmove={handleMove}
	ontouchend={handleEnd}
	role="grid"
	tabindex="0"
>
	<!-- Wood board container -->
	<div class="board-inner-frame">
		<!-- Checkered tiles grid -->
		<div class="tiles-grid">
			{#each Array(8) as _, r}
				{#each Array(8) as _, c}
					<div
						class="grid-tile"
						class:tile-light={(r + c) % 2 === 0}
						class:tile-dark={(r + c) % 2 !== 0}
						class:booster-cursor={!!$gameStore.selectedBooster}
						onmousedown={(e) => handleStart(e, r, c)}
						ontouchstart={(e) => handleStart(e, r, c)}
						role="gridcell"
						tabindex="0"
					></div>
				{/each}
			{/each}
		</div>

		<!-- Candies layer -->
		<div class="candies-layer">
			{#each flatCandies as item (item.candy.id)}
				<!-- Absolutely positioned candy item -->
				<div
					class="tile-candy-wrapper"
					class:is-active-booster={!!$gameStore.selectedBooster}
					class:is-drag-preview={isDragging && dragStartTile?.r === item.r && dragStartTile?.c === item.c}
					class:invalid-swap={isInvalidParticipant(item.r, item.c)}
					class:impact-hit={fxKeys.has(item.key)}
					class:cascade-fall={fallingIds.has(item.candy.id)}
					class:new-spawn={spawnedIds.has(item.candy.id)}
					style={wrapperStyle(item.r, item.c, item.candy.id)}
					onmousedown={(e) => handleStart(e, item.r, item.c)}
					ontouchstart={(e) => handleStart(e, item.r, item.c)}
					role="button"
					tabindex="0"
				>
					<Candy
						color={item.candy.color}
						type={item.candy.type}
						colorBlindMode={$gameStore.colorBlindMode}
						isMatching={$gameStore.matchingKeys.has(item.key)}
						size="86%"
					/>
				</div>
			{/each}
		</div>

		<!-- Effects layer -->
		<div class="fx-layer" aria-hidden="true">
			{#each blastRows as row (`row-${$gameStore.boardFx.id}-${row}`)}
				<div class="blast-beam blast-row" style="top: {row * 12.5 + 6.25}%;"></div>
			{/each}
			{#each blastCols as col (`col-${$gameStore.boardFx.id}-${col}`)}
				<div class="blast-beam blast-col" style="left: {col * 12.5 + 6.25}%;"></div>
			{/each}
			{#each fxParticles as particle (particle.id)}
				<span
					class="spark-particle"
					style="top: {particle.r * 12.5 + 6.25}%; left: {particle.c * 12.5 + 6.25}%; --angle: {particle.angle}; animation-delay: {particle.delay};"
				></span>
			{/each}
			{#if floatingScore}
				{#key floatingScore.id}
					<div
						class="floating-score"
						class:mega-score={floatingScore.combo >= 2}
						style="top: {floatingScore.r * 12.5 + 2}%; left: {floatingScore.c * 12.5 + 6.25}%;"
					>
						{floatingScore.text}
						{#if floatingScore.combo >= 2}
							<small>x{floatingScore.combo}</small>
						{/if}
					</div>
				{/key}
			{/if}
		</div>

		<!-- Combo Message Banner Overlay -->
		{#if $gameStore.showComboBanner && $gameStore.comboMessage}
			<div class="combo-banner-overlay">
				<h1 class="combo-text candy-text-stroke">{$gameStore.comboMessage}</h1>
			</div>
		{/if}
	</div>
</div>

<style>
	.board-outer-container {
		width: var(--board-size, min(100%, 480px));
		max-width: calc(100vw - 12px);
		aspect-ratio: 1;
		padding: clamp(6px, 1.8vw, 10px);
		background: linear-gradient(135deg, #b67b43 0%, #74401f 48%, #4d2b17 100%);
		border: clamp(5px, 1.6vw, 8px) solid #ffe58a;
		border-radius: clamp(18px, 5vw, 28px);
		box-shadow: 
			0 clamp(7px, 1.8vw, 12px) 0 #3b2518,
			0 16px 30px rgba(63, 31, 20, 0.38),
			inset 0 4px 0 rgba(255, 255, 255, 0.3);
		touch-action: none;
		position: relative;
		margin: 0 auto;
		will-change: transform;
		contain: layout paint;
	}

	.board-outer-container::before {
		content: '';
		position: absolute;
		inset: -8px;
		border-radius: 30px;
		background:
			linear-gradient(115deg, transparent 0 34%, rgba(255, 255, 255, 0.34) 42%, transparent 52%),
			radial-gradient(circle at 20% 15%, rgba(255, 255, 255, 0.25), transparent 22%);
		pointer-events: none;
		mix-blend-mode: screen;
		opacity: 0.65;
		z-index: 0;
	}

	.shake {
		animation: board-impact-shake 0.34s cubic-bezier(0.36, 0.07, 0.19, 0.97);
	}

	.shuffle-board {
		animation: shuffle-wobble 0.42s cubic-bezier(0.2, 0.8, 0.2, 1);
	}

	.board-inner-frame {
		width: 100%;
		height: 100%;
		position: relative;
		border-radius: 16px;
		overflow: hidden;
		background: #4a2d1b;
		box-shadow: inset 0 8px 12px rgba(0, 0, 0, 0.5);
		z-index: 1;
	}

	/* Tiles background layer */
	.tiles-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		grid-template-rows: repeat(8, 1fr);
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		z-index: 1;
	}

	.grid-tile {
		width: 100%;
		height: 100%;
		border: 1px solid rgba(255, 255, 255, 0.05);
		transition: background-color 0.2s ease;
		position: relative;
		overflow: hidden;
	}

	.grid-tile::after {
		content: '';
		position: absolute;
		inset: 12%;
		border-radius: 14px;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.34), transparent 60%);
		opacity: 0.28;
		transform: scale(0.75);
	}

	.tile-light {
		background:
			radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.3), transparent 46%),
			#ffd3e6;
	}

	.tile-dark {
		background:
			radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.2), transparent 48%),
			#ff9dc4;
	}

	.booster-cursor {
		cursor: crosshair !important;
	}

	/* Candies layer */
	.candies-layer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 2;
		pointer-events: none; /* Let pointer events go to tiles */
	}

	.tile-candy-wrapper {
		position: absolute;
		width: 12.5%;
		height: 12.5%;
		display: flex;
		justify-content: center;
		align-items: center;
		pointer-events: auto; /* Re-enable for candy selection */
		transition: 
			top 0.22s cubic-bezier(0.2, 0.9, 0.2, 1), 
			left 0.18s cubic-bezier(0.2, 0.9, 0.2, 1),
			filter 0.16s ease;
		animation: spawn-fall 0.34s cubic-bezier(0.16, 1, 0.3, 1) both;
		z-index: 2;
		will-change: transform, top, left, opacity;
		transform: translate3d(var(--drag-x, 0), var(--drag-y, 0), 0);
	}

	.tile-candy-wrapper::after {
		content: '';
		position: absolute;
		width: 62%;
		height: 16%;
		left: 19%;
		bottom: 6%;
		border-radius: 50%;
		background: rgba(80, 23, 0, 0.23);
		filter: blur(5px);
		transform: scaleX(0.86);
		z-index: -1;
		transition: transform 0.16s ease, opacity 0.16s ease;
	}

	.is-active-booster {
		cursor: crosshair !important;
	}

	.is-drag-preview {
		z-index: 6;
		filter: drop-shadow(0 12px 14px rgba(80, 23, 0, 0.26));
	}

	.is-drag-preview::after {
		transform: scaleX(1.08);
		opacity: 0.55;
	}

	.invalid-swap {
		animation: invalid-nudge 0.28s cubic-bezier(0.3, 1.5, 0.65, 1) both;
		z-index: 5;
	}

	.impact-hit {
		z-index: 4;
		filter: brightness(1.18) saturate(1.2);
	}

	.cascade-fall,
	.new-spawn {
		animation: candy-land 0.46s cubic-bezier(0.15, 0.95, 0.2, 1.12) both;
	}

	.fx-layer {
		position: absolute;
		inset: 0;
		z-index: 5;
		pointer-events: none;
		overflow: hidden;
	}

	.blast-beam {
		position: absolute;
		background:
			linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.95), #fff178, rgba(255, 255, 255, 0.95), transparent);
		box-shadow:
			0 0 16px rgba(255, 255, 255, 0.9),
			0 0 34px rgba(255, 95, 172, 0.75);
		opacity: 0;
		mix-blend-mode: screen;
	}

	.blast-row {
		left: -8%;
		width: 116%;
		height: 10%;
		transform: translateY(-50%) scaleX(0);
		animation: row-blast 0.34s ease-out both;
	}

	.blast-col {
		top: -8%;
		width: 10%;
		height: 116%;
		transform: translateX(-50%) scaleY(0);
		animation: col-blast 0.34s ease-out both;
	}

	.spark-particle {
		position: absolute;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #ffffff, #fff176 34%, #ff5bb2 70%);
		box-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
		transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(0.3);
		opacity: 0;
		animation: sparkle-burst 0.58s cubic-bezier(0.12, 0.76, 0.18, 1) both;
	}

	.floating-score {
		position: absolute;
		transform: translate(-50%, -50%);
		font-weight: 800;
		font-size: clamp(1rem, 5vw, 1.75rem);
		color: #fff;
		-webkit-text-stroke: 1.3px #501700;
		text-shadow: 0 3px 0 #501700, 0 0 16px rgba(255, 255, 255, 0.72);
		animation: score-rise 0.82s cubic-bezier(0.18, 0.9, 0.24, 1) both;
		white-space: nowrap;
	}

	.floating-score small {
		display: block;
		margin-top: -6px;
		font-size: 0.58em;
		color: #fff176;
		-webkit-text-stroke: 1px #7b2b00;
	}

	.mega-score {
		font-size: clamp(1.2rem, 6vw, 2.1rem);
	}

	@keyframes spawn-fall {
		from {
			transform: translateY(-160%) scale(0.84) rotate(-6deg);
			opacity: 0;
		}
		to {
			transform: translateY(0) scale(1) rotate(0);
			opacity: 1;
		}
	}

	@keyframes candy-land {
		0% {
			transform: translate3d(0, var(--fall-from, -220%), 0) scale(0.92);
			opacity: 0.15;
		}
		72% {
			transform: translate3d(0, 7%, 0) scaleY(0.92) scaleX(1.06);
			opacity: 1;
		}
		100% {
			transform: translate3d(0, 0, 0) scale(1);
			opacity: 1;
		}
	}

	@keyframes invalid-nudge {
		0%, 100% { transform: translate3d(0, 0, 0); }
		42% { transform: translate3d(var(--swap-x), var(--swap-y), 0) scale(1.08); }
		66% { transform: translate3d(calc(var(--swap-x) * -0.14), calc(var(--swap-y) * -0.14), 0) scale(0.98); }
	}

	@keyframes row-blast {
		0% { opacity: 0; transform: translateY(-50%) scaleX(0); }
		35% { opacity: 1; transform: translateY(-50%) scaleX(1); }
		100% { opacity: 0; transform: translateY(-50%) scaleX(1.04); }
	}

	@keyframes col-blast {
		0% { opacity: 0; transform: translateX(-50%) scaleY(0); }
		35% { opacity: 1; transform: translateX(-50%) scaleY(1); }
		100% { opacity: 0; transform: translateX(-50%) scaleY(1.04); }
	}

	@keyframes sparkle-burst {
		0% {
			opacity: 0;
			transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(0.2);
		}
		18% { opacity: 1; }
		100% {
			opacity: 0;
			transform: translate(-50%, -50%) rotate(var(--angle)) translateX(34px) scale(1);
		}
	}

	@keyframes score-rise {
		0% {
			opacity: 0;
			transform: translate(-50%, 10%) scale(0.72);
		}
		20% {
			opacity: 1;
			transform: translate(-50%, -24%) scale(1.1);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -122%) scale(0.9);
		}
	}

	@keyframes board-impact-shake {
		0%, 100% { transform: translate3d(0, 0, 0); }
		15% { transform: translate3d(-5px, 2px, 0) rotate(-0.45deg); }
		32% { transform: translate3d(5px, -3px, 0) rotate(0.45deg); }
		50% { transform: translate3d(-3px, -1px, 0) rotate(-0.3deg); }
		70% { transform: translate3d(2px, 2px, 0) rotate(0.2deg); }
	}

	@keyframes shuffle-wobble {
		0%, 100% { transform: scale(1) rotate(0); }
		22% { transform: scale(1.012) rotate(-1.2deg); }
		48% { transform: scale(0.992) rotate(1deg); }
		76% { transform: scale(1.006) rotate(-0.35deg); }
	}

	/* Combo Banner Overlay styling */
	.combo-banner-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.1);
		z-index: 10;
		pointer-events: none;
		animation: banner-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
	}

	.combo-text {
		font-size: 3rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 2px;
		animation: text-float 0.6s ease-in-out infinite alternate;
	}

	@keyframes banner-pop {
		0% {
			transform: scale(0) rotate(-10deg);
			opacity: 0;
		}
		30% {
			transform: scale(1.1) rotate(5deg);
			opacity: 1;
		}
		80% {
			transform: scale(1) rotate(0deg);
			opacity: 1;
		}
		100% {
			transform: scale(0.8);
			opacity: 0;
		}
	}

	@keyframes text-float {
		from { transform: translateY(0); }
		to { transform: translateY(-8px); }
	}

	/* Height-based responsive rules to shrink the board on short mobile viewports */
	@media (max-height: 760px) {
		.board-outer-container {
			box-shadow: 
				0 8px 0 #3b2518,
				0 10px 20px rgba(0, 0, 0, 0.3),
				inset 0 3px 0 rgba(255, 255, 255, 0.3);
		}
		.board-outer-container::before {
			inset: -6px;
			border-radius: 22px;
		}
		.combo-text {
			font-size: 2.2rem;
		}
	}

	@media (max-height: 640px) {
		.board-outer-container {
			box-shadow: 
				0 6px 0 #3b2518,
				0 8px 12px rgba(0, 0, 0, 0.3),
				inset 0 2px 0 rgba(255, 255, 255, 0.3);
		}
		.board-outer-container::before {
			inset: -4px;
			border-radius: 18px;
		}
		.combo-text {
			font-size: 1.8rem;
		}
	}
</style>
