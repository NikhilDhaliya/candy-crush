<script lang="ts">
	import { onMount } from 'svelte';
	import { gameStore } from '$lib/stores/gameStore';
	import MapScreen from '$lib/components/MapScreen.svelte';
	import GameHUD from '$lib/components/GameHUD.svelte';
	import Board from '$lib/components/Board.svelte';
	import BoosterPanel from '$lib/components/BoosterPanel.svelte';
	import Popup from '$lib/components/Popup.svelte';
	import Candy from '$lib/components/Candy.svelte';

	let loadingPercent = $state(0);

	onMount(() => {
		// Splash Screen loading simulation
		if ($gameStore.screen === 'splash') {
			const interval = setInterval(() => {
				loadingPercent += 2;
				if (loadingPercent >= 100) {
					clearInterval(interval);
					gameStore.setScreen('menu');
				}
			}, 30);
			return () => clearInterval(interval);
		}
	});
</script>

<svelte:head>
	<title>Candy Crush - Jacks Club</title>
	<meta name="description" content="A highly polished Candy Crush match-3 game clone for Jacks Club." />
</svelte:head>

<main class="game-container">
	{#if $gameStore.screen === 'splash'}
		<!-- Splash Screen -->
		<div class="splash-screen shell-screen">
			<div class="world-art" aria-hidden="true">
				<div class="cloud cloud-a"></div>
				<div class="cloud cloud-b"></div>
				<div class="lollipop pop-a"></div>
				<div class="lollipop pop-b"></div>
				<div class="candy-hill hill-a"></div>
				<div class="candy-hill hill-b"></div>
				<div class="candy-path"></div>
			</div>
			<div class="floating-candies">
				<div class="float-candy fc-1"><Candy color="red" type="standard" size={50} /></div>
				<div class="float-candy fc-2"><Candy color="yellow" type="standard" size={40} /></div>
				<div class="float-candy fc-3"><Candy color="blue" type="standard" size={60} /></div>
				<div class="float-candy fc-4"><Candy color="green" type="standard" size={45} /></div>
			</div>

			<div class="splash-logo-container logo-plaque animate-float">
				<h1 class="logo-title">
					<span class="letter-c">C</span>
					<span class="letter-a">a</span>
					<span class="letter-n">n</span>
					<span class="letter-d">d</span>
					<span class="letter-y">y</span>
					<br />
					<span class="letter-cr">C</span>
					<span class="letter-r">r</span>
					<span class="letter-u">u</span>
					<span class="letter-s">s</span>
					<span class="letter-h">h</span>
				</h1>
				<p class="logo-subtitle candy-text-stroke">Jacks Club Edition</p>
			</div>

			<div class="loading-container glass-pill">
				<span class="loading-label">Loading Sweetness... {loadingPercent}%</span>
				<div class="loading-bar-track">
					<div class="loading-bar-fill" style="width: {loadingPercent}%"></div>
				</div>
			</div>
		</div>
	{:else if $gameStore.screen === 'menu'}
		<!-- Main Menu Screen -->
		<div class="menu-screen shell-screen">
			<div class="world-art" aria-hidden="true">
				<div class="cloud cloud-a"></div>
				<div class="cloud cloud-b"></div>
				<div class="lollipop pop-a"></div>
				<div class="lollipop pop-b"></div>
				<div class="candy-hill hill-a"></div>
				<div class="candy-hill hill-b"></div>
				<div class="candy-path"></div>
			</div>
			<div class="menu-logo-container logo-plaque animate-float">
				<h1 class="logo-title">
					<span class="letter-c">C</span>
					<span class="letter-a">a</span>
					<span class="letter-n">n</span>
					<span class="letter-d">d</span>
					<span class="letter-y">y</span>
					<br />
					<span class="letter-cr">C</span>
					<span class="letter-r">r</span>
					<span class="letter-u">u</span>
					<span class="letter-s">s</span>
					<span class="letter-h">h</span>
				</h1>
				<p class="logo-subtitle candy-text-stroke">Jacks Club Edition</p>
			</div>

			<div class="menu-card">
				<div class="menu-coins">
					<span class="coin-medal">C</span>
					<span>{$gameStore.coins} Coins</span>
				</div>
				<div class="menu-buttons">
				<button
					class="candy-btn candy-btn-orange play-btn"
					onclick={() => gameStore.setScreen('map')}
				>
					Play Game
				</button>
				</div>
				<div class="menu-secondary">
					<span>20 levels</span>
					<span>Boosters ready</span>
				</div>
			</div>
		</div>
	{:else if $gameStore.screen === 'map'}
		<!-- Level Select Map -->
		<MapScreen />
	{:else if $gameStore.screen === 'game'}
		<!-- Gameplay Screen -->
		<div class="gameplay-screen">
			<GameHUD />
			<Board />
			<BoosterPanel />
			<Popup />
		</div>
	{/if}
</main>

<style>
	.game-container {
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		position: relative;
	}

	/* Shell screens */
	.shell-screen {
		width: 100vw;
		height: 100vh;
		height: 100dvh;
		max-width: 540px;
		background:
			radial-gradient(circle at 22% 16%, rgba(255, 255, 255, 0.72), transparent 18%),
			linear-gradient(180deg, #7fd8ff 0%, #b9efff 42%, #ffd8ea 100%);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		padding: max(18px, env(safe-area-inset-top)) 18px max(20px, env(safe-area-inset-bottom));
		box-shadow: 0 24px 70px rgba(23, 14, 38, 0.45);
		overflow: hidden;
		isolation: isolate;
	}

	.shell-screen::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(90deg, rgba(255, 255, 255, 0.2), transparent 24% 76%, rgba(255, 255, 255, 0.18)),
			linear-gradient(180deg, transparent 0 58%, rgba(255, 255, 255, 0.2));
		pointer-events: none;
		z-index: -1;
	}

	.world-art {
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
	}

	.cloud {
		position: absolute;
		width: 118px;
		height: 42px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.68);
		box-shadow:
			28px -12px 0 6px rgba(255, 255, 255, 0.58),
			60px 1px 0 2px rgba(255, 255, 255, 0.5);
		filter: blur(0.2px);
	}

	.cloud-a {
		top: 9%;
		left: -22px;
		transform: scale(0.85);
	}

	.cloud-b {
		top: 18%;
		right: -34px;
		transform: scale(0.72);
		opacity: 0.76;
	}

	.candy-hill {
		position: absolute;
		bottom: -7%;
		border-radius: 50% 50% 0 0;
	}

	.hill-a {
		left: -18%;
		width: 82%;
		height: 30%;
		background:
			radial-gradient(circle at 30% 18%, rgba(255, 255, 255, 0.34), transparent 24%),
			linear-gradient(180deg, #ff8bc2, #d84691);
	}

	.hill-b {
		right: -22%;
		width: 78%;
		height: 25%;
		background:
			radial-gradient(circle at 62% 22%, rgba(255, 255, 255, 0.32), transparent 24%),
			linear-gradient(180deg, #ffe470, #ffb83f);
	}

	.candy-path {
		position: absolute;
		left: 50%;
		bottom: -13%;
		width: min(64vw, 310px);
		height: 34%;
		border-radius: 50% 50% 0 0;
		background:
			repeating-linear-gradient(88deg, #fff6da 0 22px, #ff9ac3 22px 42px),
			#fff6da;
		border: 6px solid rgba(255, 255, 255, 0.72);
		box-shadow: inset 0 10px 18px rgba(255, 255, 255, 0.35), 0 -4px 20px rgba(130, 50, 78, 0.18);
		transform: translateX(-50%) perspective(200px) rotateX(36deg);
		transform-origin: bottom;
	}

	.lollipop {
		position: absolute;
		width: 54px;
		height: 54px;
		border-radius: 50%;
		background:
			conic-gradient(#ff3e78 0 25%, #fff 0 50%, #55c7ff 0 75%, #fff 0),
			#fff;
		border: 5px solid rgba(255, 255, 255, 0.75);
		box-shadow: 0 7px 0 rgba(122, 57, 36, 0.22), inset 0 3px 7px rgba(255, 255, 255, 0.7);
	}

	.lollipop::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 44px;
		width: 7px;
		height: 82px;
		border-radius: 999px;
		background: #f6e0c5;
		transform: translateX(-50%);
		box-shadow: inset 2px 0 rgba(255, 255, 255, 0.42);
	}

	.pop-a {
		left: 9%;
		bottom: 21%;
		transform: rotate(-13deg);
	}

	.pop-b {
		right: 10%;
		bottom: 27%;
		transform: scale(0.78) rotate(12deg);
	}

	.floating-candies {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
		opacity: 0.92;
	}

	.float-candy {
		position: absolute;
		animation: float-around 6s ease-in-out infinite alternate;
	}

	.fc-1 { top: 13%; left: 13%; animation-delay: 0s; }
	.fc-2 { top: 67%; left: 10%; animation-delay: 1.5s; }
	.fc-3 { top: 16%; left: 76%; animation-delay: 0.8s; }
	.fc-4 { top: 70%; left: 73%; animation-delay: 2.2s; }

	@keyframes float-around {
		0% { transform: translateY(0) rotate(0deg); }
		100% { transform: translateY(-20px) rotate(15deg); }
	}

	.splash-logo-container,
	.menu-logo-container {
		text-align: center;
		z-index: 2;
		margin-bottom: clamp(24px, 6dvh, 42px);
	}

	.logo-plaque {
		position: relative;
		padding: clamp(14px, 3vw, 20px) clamp(18px, 5vw, 28px) clamp(12px, 3vw, 18px);
		border-radius: 32px;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(255, 244, 250, 0.58)),
			radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.9), transparent 48%);
		border: 4px solid rgba(255, 255, 255, 0.85);
		box-shadow:
			0 10px 0 rgba(193, 73, 132, 0.4),
			0 20px 34px rgba(99, 39, 80, 0.25),
			inset 0 3px 0 rgba(255, 255, 255, 0.78);
	}

	.logo-title {
		font-family: 'Fredoka', sans-serif;
		font-weight: 700;
		font-size: clamp(3.65rem, 15vw, 5.5rem);
		line-height: 0.82;
		letter-spacing: 0;
		margin: 0;
	}

	.logo-title span {
		display: inline-block;
		text-shadow: 
			0 3px 0 #7b2d0e,
			0 7px 0 rgba(116, 45, 24, 0.22),
			0 12px 18px rgba(66, 21, 47, 0.28);
		-webkit-text-stroke: 2px #6a240d;
	}

	/* Candy Letter Colors */
	.letter-c { color: #ff0e4f; transform: rotate(-8deg) scale(1.1); }
	.letter-a { color: #ff7e00; transform: rotate(4deg); }
	.letter-n { color: #ffde00; transform: rotate(-5deg); }
	.letter-d { color: #00d215; transform: rotate(6deg) scale(1.05); }
	.letter-y { color: #00b4ff; transform: rotate(-4deg); }

	.letter-cr { color: #b600ff; transform: rotate(-10deg) scale(1.15); }
	.letter-r { color: #ff0e4f; transform: rotate(5deg); }
	.letter-u { color: #ff7e00; transform: rotate(-6deg); }
	.letter-s { color: #ffde00; transform: rotate(7deg); }
	.letter-h { color: #00d215; transform: rotate(-4deg) scale(1.1); }

	.logo-subtitle {
		font-size: clamp(1rem, 4vw, 1.35rem);
		font-weight: 700;
		margin-top: 12px;
		color: #fff;
		letter-spacing: 0;
	}

	.loading-container {
		width: min(78%, 320px);
		max-width: 300px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 9px;
		z-index: 2;
	}

	.glass-pill {
		padding: 12px 14px;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.58);
		border: 2px solid rgba(255, 255, 255, 0.76);
		box-shadow: 0 8px 22px rgba(85, 38, 77, 0.18);
	}

	.loading-label {
		font-size: 0.95rem;
		font-weight: 700;
		color: #6a240d;
	}

	.loading-bar-track {
		width: 100%;
		height: 17px;
		background: rgba(94, 44, 27, 0.18);
		border-radius: 10px;
		border: 3px solid rgba(106, 36, 13, 0.72);
		overflow: hidden;
	}

	.loading-bar-fill {
		height: 100%;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.52), transparent 48%),
			linear-gradient(to right, #ffef62, #ff9f1c, #ff4f8b);
		border-radius: 10px;
	}

	.menu-screen {
		gap: clamp(18px, 4dvh, 28px);
		justify-content: center;
	}

	.menu-card {
		z-index: 2;
		width: min(88vw, 360px);
		padding: 18px;
		border-radius: 28px;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 244, 250, 0.76));
		border: 4px solid rgba(255, 255, 255, 0.9);
		box-shadow:
			0 10px 0 rgba(189, 75, 122, 0.45),
			0 18px 34px rgba(74, 33, 5, 0.2),
			inset 0 3px 0 rgba(255, 255, 255, 0.8);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 15px;
	}

	.play-btn {
		min-width: 232px;
		font-size: 1.7rem;
		padding: 15px 42px;
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.38), transparent 42%),
			linear-gradient(180deg, #ffb342 0%, #f06416 100%);
		border-width: 4px;
		box-shadow:
			0 7px 0 #b93b0d,
			0 12px 18px rgba(120, 45, 16, 0.24);
	}

	.menu-coins {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 1.06rem;
		font-weight: 700;
		color: #e65100;
		background: #fff8d7;
		border: 2px solid #ffc940;
		padding: 6px 14px;
		border-radius: 999px;
		box-shadow: 0 3px 0 #f1a417;
	}

	.coin-medal {
		width: 22px;
		height: 22px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: linear-gradient(180deg, #fff173, #f7aa12);
		color: #a75d00;
		font-size: 0.78rem;
		border: 2px solid #fff7b8;
		box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.8);
	}

	.menu-secondary {
		display: flex;
		gap: 10px;
		color: #874426;
		font-size: 0.82rem;
		font-weight: 700;
	}

	.menu-secondary span {
		padding: 4px 9px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.62);
	}

	/* Gameplay Screen */
	.gameplay-screen {
		--screen-pad-x: clamp(8px, 2.5vw, 18px);
		--screen-pad-top: max(8px, env(safe-area-inset-top));
		--screen-pad-bottom: max(8px, env(safe-area-inset-bottom));
		--board-size: min(calc(100vw - var(--screen-pad-x) * 2), calc(100dvh - 198px), 512px);
		width: 100vw;
		height: 100vh;
		height: 100dvh;
		max-width: 540px;
		background-color: #a2e3f4;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0%25' stop-color='%23a2e3f4'/%3E%3Cstop offset='70%25' stop-color='%23dcf7fd'/%3E%3Cstop offset='100%25' stop-color='%23fcfdff'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' fill='url(%23g)'/%3E%3Ccircle cx='12' cy='25' r='14' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='22' cy='28' r='10' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='80' cy='18' r='12' fill='%23ffffff' opacity='0.35'/%3E%3Ccircle cx='88' cy='21' r='9' fill='%23ffffff' opacity='0.35'/%3E%3Cpath d='M-10 105 Q15 88 40 102 T90 92 T110 103 L110 110 L-10 110 Z' fill='%23ffe8d6' opacity='0.4'/%3E%3Cpath d='M-10 105 Q25 95 60 105 T110 98 L110 110 L-10 110 Z' fill='%23ffe0cc' opacity='0.35'/%3E%3C/svg%3E");
		background-size: cover;
		background-position: bottom;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		align-items: center;
		justify-items: center;
		gap: clamp(6px, 1.4dvh, 12px);
		padding:
			var(--screen-pad-top)
			var(--screen-pad-x)
			var(--screen-pad-bottom);
		box-shadow: 0 0 34px rgba(52, 42, 64, 0.34);
		overflow: hidden;
		position: relative;
		isolation: isolate;
	}

	.gameplay-screen::before {
		content: none;
	}

	@media (max-height: 760px) {
		.gameplay-screen {
			--board-size: min(calc(100vw - var(--screen-pad-x) * 2), calc(100dvh - 160px), 500px);
			gap: 6px;
		}
	}

	@media (max-height: 640px) {
		.gameplay-screen {
			--board-size: min(calc(100vw - var(--screen-pad-x) * 2), calc(100dvh - 126px), 460px);
			gap: 4px;
		}
	}

	@media (min-width: 800px) {
		.game-container {
			background:
				radial-gradient(ellipse 150px 56px at 12% 16%, rgba(255, 255, 255, 0.72) 0 45%, transparent 46%),
				radial-gradient(ellipse 118px 44px at 20% 20%, rgba(255, 255, 255, 0.48) 0 45%, transparent 46%),
				radial-gradient(ellipse 170px 62px at 86% 14%, rgba(255, 255, 255, 0.68) 0 45%, transparent 46%),
				radial-gradient(ellipse 128px 48px at 78% 19%, rgba(255, 255, 255, 0.44) 0 45%, transparent 46%),
				radial-gradient(ellipse 42vw 23vh at 5% 108%, #ff86bd 0 60%, transparent 61%),
				radial-gradient(ellipse 46vw 26vh at 96% 106%, #ffd95b 0 59%, transparent 60%),
				radial-gradient(ellipse 20vw 15vh at 50% 112%, #fff3cd 0 60%, transparent 61%),
				repeating-linear-gradient(82deg, transparent 0 34px, rgba(255, 255, 255, 0.16) 34px 42px),
				linear-gradient(180deg, #78d9ff 0%, #bff2ff 44%, #ffd8eb 100%);
		}

		.shell-screen {
			width: min(540px, 42vw);
			min-width: 430px;
			border-left: 1px solid rgba(255, 255, 255, 0.28);
			border-right: 1px solid rgba(80, 23, 0, 0.2);
			box-shadow:
				0 24px 70px rgba(23, 14, 38, 0.52),
				0 0 0 10px rgba(255, 255, 255, 0.06);
		}

		.gameplay-screen {
			--board-size: min(512px, calc(100dvh - 216px), 42vw);
			width: min(540px, 42vw);
			min-width: 430px;
			border-left: 1px solid rgba(255, 255, 255, 0.28);
			border-right: 1px solid rgba(80, 23, 0, 0.2);
			box-shadow:
				0 24px 70px rgba(23, 14, 38, 0.5),
				0 0 0 10px rgba(255, 255, 255, 0.06);
		}
	}

	@media (max-width: 420px) {
		.gameplay-screen {
			--screen-pad-x: 7px;
		}
	}

	/* Responsive scaling rules for small mobile viewports */
	@media (max-height: 700px) {
		.logo-title {
			font-size: 3.6rem;
		}
		.logo-subtitle {
			font-size: 1.3rem;
			margin-top: 5px;
		}
		.play-btn {
			font-size: 1.5rem;
			padding: 12px 36px;
		}
		.menu-screen {
			gap: 12px;
			padding: 16px;
		}
		.splash-screen {
			padding: 12px;
		}
	}

	@media (max-height: 560px) {
		.logo-title {
			font-size: 2.8rem;
		}
		.logo-subtitle {
			font-size: 1.1rem;
		}
		.play-btn {
			font-size: 1.3rem;
			padding: 10px 28px;
		}
		.menu-screen {
			gap: 8px;
		}
	}
</style>
