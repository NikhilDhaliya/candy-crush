<script lang="ts">
	import type { CandyColor, CandyType } from '../utils/matchEngine';

	let {
		color = 'red',
		type = 'standard',
		colorBlindMode = false,
		size = 60,
		isMatching = false
	}: {
		color: CandyColor;
		type: CandyType;
		colorBlindMode?: boolean;
		size?: number | string;
		isMatching?: boolean;
	} = $props();

	// Map colors to gradients
	const gradients = {
		red: { start: '#ff5c8a', end: '#d3003b', highlight: '#ff9ebb' },
		orange: { start: '#ffaa3b', end: '#ef6c00', highlight: '#ffd180' },
		yellow: { start: '#ffea6c', end: '#fbc02d', highlight: '#fff9c4' },
		green: { start: '#7ee57b', end: '#2e7d32', highlight: '#b9f6ca' },
		blue: { start: '#4fc3f7', end: '#0277bd', highlight: '#80d8ff' },
		purple: { start: '#e040fb', end: '#7b1fa2', highlight: '#ea80fc' },
		multicolor: { start: '#3e2723', end: '#1a0c00', highlight: '#795548' } // chocolate for color bomb
	};

	const grad = $derived(gradients[color] || gradients.red);
	const candySize = $derived(typeof size === 'number' ? `${size}px` : size);
</script>

<div
	class="candy-container"
	class:is-matching={isMatching}
	class:is-wrapped={type === 'wrapped'}
	style="width: {candySize}; height: {candySize};"
>
	<svg
		viewBox="0 0 80 80"
		width="100%"
		height="100%"
		xmlns="http://www.w3.org/2000/svg"
		class="candy-svg"
	>
		<defs>
			<!-- Base Color Gradients -->
			<radialGradient id="grad-{color}" cx="35%" cy="30%" r="70%">
				<stop offset="0%" stop-color={grad.highlight} />
				<stop offset="60%" stop-color={grad.start} />
				<stop offset="100%" stop-color={grad.end} />
			</radialGradient>

			<!-- 3D Shadow Filter -->
			<filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
				<feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.3" />
			</filter>

			<!-- Translucent shine gradient for wrapper -->
			<linearGradient id="wrapper-shine" x1="0%" y1="0%" x2="100%" y2="100%">
				<stop offset="0%" stop-color="rgba(255,255,255,0.7)" />
				<stop offset="40%" stop-color="rgba(255,255,255,0.2)" />
				<stop offset="100%" stop-color="rgba(255,255,255,0.5)" />
			</linearGradient>
		</defs>

		<g filter="url(#shadow)">
			<!-- 1. Special Wrapper Layer (for Wrapped Candy) -->
			{#if type === 'wrapped'}
				<!-- Shiny, crinkled wrapper background -->
				<g class="wrapper-bg">
					<!-- Wrapper left ear -->
					<path d="M 12 25 L 2 28 L 2 52 L 12 55 Z" fill="url(#wrapper-shine)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" />
					<line x1="2" y1="35" x2="12" y2="38" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
					<line x1="2" y1="45" x2="12" y2="42" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
					
					<!-- Wrapper right ear -->
					<path d="M 68 25 L 78 28 L 78 52 L 68 55 Z" fill="url(#wrapper-shine)" stroke="rgba(255,255,255,0.6)" stroke-width="1.5" />
					<line x1="78" y1="35" x2="68" y2="38" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />
					<line x1="78" y1="45" x2="68" y2="42" stroke="rgba(255,255,255,0.7)" stroke-width="1.5" />

					<!-- Main square box -->
					<rect x="10" y="10" width="60" height="60" rx="14" fill="url(#wrapper-shine)" stroke="rgba(255,255,255,0.8)" stroke-width="2" />
				</g>
			{/if}

			<!-- 2. Candy Body Shapes -->
			{#if type === 'color_bomb'}
				<!-- Chocolate Sphere -->
				<circle cx="40" cy="40" r="28" fill="url(#grad-multicolor)" stroke="#5d4037" stroke-width="2" />
				<!-- Multi-colored sprinkles -->
				<circle cx="25" cy="30" r="4" fill="#ff0055" />
				<circle cx="33" cy="20" r="4" fill="#00ffcc" />
				<circle cx="45" cy="22" r="4" fill="#ffff00" />
				<circle cx="55" cy="32" r="4" fill="#ff9900" />
				<circle cx="53" cy="48" r="4" fill="#ff00ff" />
				<circle cx="43" cy="58" r="4" fill="#00ff00" />
				<circle cx="28" cy="54" r="4" fill="#00b4ff" />
				<circle cx="34" cy="40" r="5" fill="#e040fb" />
				<circle cx="46" cy="42" r="4.5" fill="#ffeb3b" />
				<circle cx="22" cy="44" r="4" fill="#ff5722" />
				<!-- Glossy reflection -->
				<path d="M 20 22 C 30 14, 50 14, 60 22 C 55 18, 25 18, 20 22 Z" fill="#ffffff" opacity="0.6" />
			{:else if color === 'red'}
				<!-- Red Jellybean (tilted pill shape) -->
				<g transform="rotate(12 40 40)">
					<rect x="16" y="24" width="48" height="32" rx="16" ry="16" fill="url(#grad-red)" />
					<!-- Shine -->
					<ellipse cx="40" cy="30" rx="16" ry="4" fill="#ffffff" opacity="0.65" />
				</g>
			{:else if color === 'orange'}
				<!-- Orange Lozenge (wide oval) -->
				<ellipse cx="40" cy="40" rx="30" ry="22" fill="url(#grad-orange)" />
				<!-- Shine -->
				<path d="M 20 30 C 30 22, 50 22, 60 30 C 50 26, 30 26, 20 30 Z" fill="#ffffff" opacity="0.6" />
				<circle cx="54" cy="34" r="3.5" fill="#ffffff" opacity="0.4" />
			{:else if color === 'yellow'}
				<!-- Yellow Teardrop -->
				<path d="M 40 14 C 55 30, 62 46, 55 58 C 47 67, 33 67, 25 58 C 18 46, 25 30, 40 14 Z" fill="url(#grad-yellow)" />
				<!-- Shine -->
				<path d="M 32 32 C 38 24, 42 24, 48 32 C 43 28, 37 28, 32 32 Z" fill="#ffffff" opacity="0.6" />
				<ellipse cx="40" cy="52" rx="12" ry="5" fill="#ffffff" opacity="0.25" />
			{:else if color === 'green'}
				<!-- Green Pillow (rounded square) -->
				<rect x="15" y="15" width="50" height="50" rx="16" ry="16" fill="url(#grad-green)" />
				<!-- Cross Highlight -->
				<path d="M 20 20 C 30 28, 50 28, 60 20" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.6" />
				<circle cx="28" cy="28" r="4" fill="#ffffff" opacity="0.5" />
			{:else if color === 'blue'}
				<!-- Blue Sphere -->
				<circle cx="40" cy="40" r="26" fill="url(#grad-blue)" />
				<!-- Crescent highlight -->
				<path d="M 22 26 C 30 18, 50 18, 58 26 C 50 22, 30 22, 22 26 Z" fill="#ffffff" opacity="0.65" />
				<circle cx="26" cy="26" r="3" fill="#ffffff" opacity="0.5" />
			{:else if color === 'purple'}
				<!-- Purple Flower (5-lobe shape) -->
				<path d="M 40 15 
					C 47 15, 49 22, 47 28 
					C 53 25, 59 28, 57 35 
					C 62 38, 61 46, 56 48 
					C 58 54, 52 59, 46 56 
					C 42 61, 34 59, 32 54
					C 26 56, 21 51, 23 45
					C 18 41, 20 33, 26 31
					C 25 25, 30 19, 37 22
					C 37 17, 39 15, 40 15 Z" fill="url(#grad-purple)" />
				<!-- Shine -->
				<circle cx="40" cy="30" r="6" fill="#ffffff" opacity="0.5" />
				<path d="M 30 27 C 35 23, 45 23, 50 27" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.4" />
			{/if}

			<!-- 3. Stripes Overlay Layer (for Striped Candy) -->
			{#if type === 'striped_h'}
				<!-- Horizontal Stripes -->
				<g class="stripes-h" opacity="0.75">
					<rect x="10" y="24" width="60" height="6" fill="#ffffff" rx="2" />
					<rect x="8" y="37" width="64" height="6" fill="#ffffff" rx="2" />
					<rect x="10" y="50" width="60" height="6" fill="#ffffff" rx="2" />
				</g>
			{:else if type === 'striped_v'}
				<!-- Vertical Stripes -->
				<g class="stripes-v" opacity="0.75">
					<rect x="24" y="10" width="6" height="60" fill="#ffffff" rx="2" />
					<rect x="37" y="8" width="6" height="64" fill="#ffffff" rx="2" />
					<rect x="50" y="10" width="6" height="60" fill="#ffffff" rx="2" />
				</g>
			{/if}

			<!-- 4. Accessibility / Color Blind Mode Markers -->
			{#if colorBlindMode && type !== 'color_bomb'}
				<g class="colorblind-marker" opacity="0.8" transform="translate(40, 40)">
					{#if color === 'red'}
						<!-- Heart -->
						<path d="M 0 -8 C -4 -13, -11 -10, -11 -4 C -11 3, -2 8, 0 11 C 2 8, 11 3, 11 -4 C 11 -10, 4 -13, 0 -8 Z" fill="#ffffff" stroke="#d3003b" stroke-width="1.5" transform="scale(0.8)" />
					{:else if color === 'orange'}
						<!-- Diamond -->
						<path d="M 0 -10 L 10 0 L 0 10 L -10 0 Z" fill="#ffffff" stroke="#ef6c00" stroke-width="1.5" transform="scale(0.8)" />
					{:else if color === 'yellow'}
						<!-- Star -->
						<path d="M 0 -12 L 3 -3 L 12 -3 L 5 2 L 8 11 L 0 5 L -8 11 L -5 2 L -12 -3 L -3 -3 Z" fill="#ffffff" stroke="#fbc02d" stroke-width="1.5" transform="scale(0.7)" />
					{:else if color === 'green'}
						<!-- Square -->
						<rect x="-8" y="-8" width="16" height="16" rx="3" fill="#ffffff" stroke="#2e7d32" stroke-width="1.5" transform="scale(0.8)" />
					{:else if color === 'blue'}
						<!-- Circle with Cross -->
						<circle cx="0" cy="0" r="8" fill="#ffffff" stroke="#0277bd" stroke-width="1.5" transform="scale(0.8)" />
						<path d="M -5 0 L 5 0 M 0 -5 L 0 5" stroke="#0277bd" stroke-width="2" transform="scale(0.8)" />
					{:else if color === 'purple'}
						<!-- Triangle -->
						<path d="M 0 -10 L 10 8 L -10 8 Z" fill="#ffffff" stroke="#7b1fa2" stroke-width="1.5" transform="scale(0.8)" />
					{/if}
				</g>
			{/if}
		</g>
	</svg>
</div>

<style>
	.candy-container {
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: grab;
		position: relative;
		transform-origin: center;
		transition: transform 0.1s ease, filter 0.16s ease;
		will-change: transform, opacity;
	}

	.candy-container:active {
		cursor: grabbing;
		transform: scale(1.1);
	}

	.candy-svg {
		display: block;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.candy-container::before {
		content: '';
		position: absolute;
		inset: 7%;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(255, 255, 255, 0.42), transparent 58%);
		opacity: 0;
		transform: scale(0.7);
		pointer-events: none;
	}

	.is-wrapped .candy-svg,
	.candy-container:has(.stripes-h) .candy-svg,
	.candy-container:has(.stripes-v) .candy-svg {
		animation: subtle-pulse 2.5s ease-in-out infinite;
	}

	@keyframes subtle-pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.02); }
	}

	/* Destroying animations */
	.is-matching {
		animation: pop-destroy 0.26s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
		filter: brightness(1.3) saturate(1.2);
	}

	.is-matching::before {
		animation: candy-flash 0.22s ease-out both;
	}

	@keyframes pop-destroy {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.25);
			filter: brightness(1.5);
		}
		100% {
			transform: scale(0) rotate(18deg);
			opacity: 0;
		}
	}

	@keyframes candy-flash {
		0% {
			opacity: 0;
			transform: scale(0.7);
		}
		50% {
			opacity: 0.9;
			transform: scale(1.22);
		}
		100% {
			opacity: 0;
			transform: scale(1.55);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.candy-svg,
		.is-matching,
		.is-matching::before {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
		}
	}
</style>
