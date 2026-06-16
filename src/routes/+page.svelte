<script lang="ts">
	import { onMount } from 'svelte';
	import { gameStore } from '$lib/stores/gameStore';
	import MapScreen from '$lib/components/MapScreen.svelte';
	import GameHUD from '$lib/components/GameHUD.svelte';
	import Board from '$lib/components/Board.svelte';
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
		<div class="splash-screen">
			<div class="floating-candies">
				<div class="float-candy fc-1"><Candy color="red" type="standard" size={50} /></div>
				<div class="float-candy fc-2"><Candy color="yellow" type="standard" size={40} /></div>
				<div class="float-candy fc-3"><Candy color="blue" type="standard" size={60} /></div>
				<div class="float-candy fc-4"><Candy color="green" type="standard" size={45} /></div>
			</div>

			<div class="splash-logo-container animate-float">
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

			<div class="loading-container">
				<span class="loading-label">Loading Sweetness... {loadingPercent}%</span>
				<div class="loading-bar-track">
					<div class="loading-bar-fill" style="width: {loadingPercent}%"></div>
				</div>
			</div>
		</div>
	{:else if $gameStore.screen === 'menu'}
		<!-- Main Menu Screen -->
		<div class="menu-screen candy-panel">
			<div class="menu-logo-container animate-float">
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

			<div class="menu-buttons">
				<button
					class="candy-btn candy-btn-orange play-btn"
					onclick={() => gameStore.setScreen('map')}
				>
					Play Game
				</button>
			</div>

			<div class="menu-coins">
				<span class="coin-icon">🪙</span>
				<span>{$gameStore.coins} Coins</span>
			</div>

			<div class="menu-footer">
				<span>Created for Jacks Club</span>
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

	/* Splash Screen */
	.splash-screen {
		width: 100vw;
		height: 100vh;
		max-width: 480px;
		background: radial-gradient(circle, #ffb4d6 0%, #80d8ff 100%);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		padding: 20px;
		box-shadow: 0 0 30px rgba(0,0,0,0.3);
		overflow: hidden;
	}

	.floating-candies {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
	}

	.float-candy {
		position: absolute;
		animation: float-around 6s ease-in-out infinite alternate;
	}

	.fc-1 { top: 12%; left: 15%; animation-delay: 0s; }
	.fc-2 { top: 70%; left: 12%; animation-delay: 1.5s; }
	.fc-3 { top: 20%; left: 75%; animation-delay: 0.8s; }
	.fc-4 { top: 75%; left: 70%; animation-delay: 2.2s; }

	@keyframes float-around {
		0% { transform: translateY(0) rotate(0deg); }
		100% { transform: translateY(-20px) rotate(15deg); }
	}

	.splash-logo-container, .menu-logo-container {
		text-align: center;
		z-index: 2;
		margin-bottom: 40px;
	}

	.logo-title {
		font-family: 'Fredoka', sans-serif;
		font-weight: 700;
		font-size: 4.8rem;
		line-height: 0.9;
		letter-spacing: -2px;
		margin: 0;
	}

	.logo-title span {
		display: inline-block;
		text-shadow: 
			0 4px 0px #501700, 
			0 8px 10px rgba(0, 0, 0, 0.3);
		-webkit-text-stroke: 2px #501700;
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
		font-size: 1.6rem;
		font-weight: 700;
		margin-top: 10px;
		color: #fff;
		letter-spacing: 1px;
	}

	.loading-container {
		width: 80%;
		max-width: 300px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		z-index: 2;
	}

	.loading-label {
		font-size: 0.95rem;
		font-weight: 700;
		color: #501700;
	}

	.loading-bar-track {
		width: 100%;
		height: 16px;
		background: rgba(255, 255, 255, 0.4);
		border-radius: 10px;
		border: 3px solid #501700;
		overflow: hidden;
	}

	.loading-bar-fill {
		height: 100%;
		background: linear-gradient(to right, #ffd54f, #ff8f00);
		border-radius: 10px;
	}

	/* Menu Screen */
	.menu-screen {
		width: 90vw;
		height: 80vh;
		max-width: 400px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 24px;
		gap: 20px;
	}

	.play-btn {
		font-size: 1.8rem;
		padding: 16px 44px;
	}

	.menu-coins {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 1.25rem;
		font-weight: 700;
		color: #e65100;
		background: #fff8e1;
		border: 2px solid #ffd54f;
		padding: 6px 16px;
		border-radius: 20px;
		box-shadow: 0 3px 0 #ffd54f;
	}

	.menu-footer {
		font-size: 0.8rem;
		font-weight: 600;
		color: #d93d8b;
		margin-top: 20px;
	}

	/* Gameplay Screen */
	.gameplay-screen {
		width: 100vw;
		height: 100vh;
		max-width: 480px;
		background: radial-gradient(circle, #ffb4d6 0%, #b3e5fc 100%);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding: 16px;
		box-shadow: 0 0 30px rgba(0,0,0,0.3);
		overflow: hidden;
	}
</style>
