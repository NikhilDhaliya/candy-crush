import { get } from 'svelte/store';
import { gameStore } from '../stores/gameStore';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
	if (!audioCtx) {
		audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
	}
	// Resume if suspended (browser security policy)
	if (audioCtx.state === 'suspended') {
		audioCtx.resume();
	}
	return audioCtx;
}

export function playSound(
	type: 'swap' | 'invalid' | 'match' | 'cascade' | 'spawn' | 'bomb' | 'shuffle' | 'victory' | 'defeat',
	overrideVolume: number = 1.0
) {
	// Check sound settings from store
	try {
		const state = get(gameStore);
		if (state && !state.soundOn) return;
	} catch (e) {
		// Store might not be fully initialized yet
	}

	try {
		const ctx = getAudioContext();
		const now = ctx.currentTime;

		const masterGain = ctx.createGain();
		masterGain.gain.setValueAtTime(overrideVolume * 0.15, now);
		masterGain.connect(ctx.destination);

		switch (type) {
			case 'swap': {
				// Fast sweep: sound of swapping candies
				const osc = ctx.createOscillator();
				osc.type = 'triangle';
				osc.frequency.setValueAtTime(300, now);
				osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);

				const gainNode = ctx.createGain();
				gainNode.gain.setValueAtTime(0.5, now);
				gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

				osc.connect(gainNode);
				gainNode.connect(masterGain);

				osc.start(now);
				osc.stop(now + 0.15);
				break;
			}
			case 'invalid': {
				const osc = ctx.createOscillator();
				osc.type = 'square';
				osc.frequency.setValueAtTime(180, now);
				osc.frequency.exponentialRampToValueAtTime(95, now + 0.16);

				const gainNode = ctx.createGain();
				gainNode.gain.setValueAtTime(0.36, now);
				gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

				osc.connect(gainNode);
				gainNode.connect(masterGain);
				osc.start(now);
				osc.stop(now + 0.16);
				break;
			}
			case 'match': {
				// Sweet double-chime (sine waves, high pitch)
				const playChime = (freq: number, delay: number) => {
					const osc = ctx.createOscillator();
					osc.type = 'sine';
					osc.frequency.setValueAtTime(freq, now + delay);

					const gainNode = ctx.createGain();
					gainNode.gain.setValueAtTime(0.01, now + delay);
					gainNode.gain.exponentialRampToValueAtTime(0.6, now + delay + 0.02);
					gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.25);

					osc.connect(gainNode);
					gainNode.connect(masterGain);

					osc.start(now + delay);
					osc.stop(now + delay + 0.25);
				};

				playChime(659.25, 0); // E5
				playChime(880, 0.06); // A5
				break;
			}
			case 'cascade': {
				const notes = [523.25, 659.25, 783.99];
				notes.forEach((freq, index) => {
					const osc = ctx.createOscillator();
					const delay = index * 0.045;
					osc.type = 'triangle';
					osc.frequency.setValueAtTime(freq, now + delay);

					const gainNode = ctx.createGain();
					gainNode.gain.setValueAtTime(0.01, now + delay);
					gainNode.gain.exponentialRampToValueAtTime(0.32, now + delay + 0.018);
					gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.18);

					osc.connect(gainNode);
					gainNode.connect(masterGain);
					osc.start(now + delay);
					osc.stop(now + delay + 0.2);
				});
				break;
			}
			case 'spawn': {
				const osc = ctx.createOscillator();
				osc.type = 'sine';
				osc.frequency.setValueAtTime(760, now);
				osc.frequency.exponentialRampToValueAtTime(1120, now + 0.12);

				const gainNode = ctx.createGain();
				gainNode.gain.setValueAtTime(0.01, now);
				gainNode.gain.exponentialRampToValueAtTime(0.26, now + 0.02);
				gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

				osc.connect(gainNode);
				gainNode.connect(masterGain);
				osc.start(now);
				osc.stop(now + 0.18);
				break;
			}
			case 'bomb': {
				// Explosion: white noise with resonant bandpass filter
				const bufferSize = ctx.sampleRate * 0.35; // 0.35 seconds
				const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
				const data = buffer.getChannelData(0);
				for (let i = 0; i < bufferSize; i++) {
					data[i] = Math.random() * 2 - 1;
				}

				const noiseNode = ctx.createBufferSource();
				noiseNode.buffer = buffer;

				const filterNode = ctx.createBiquadFilter();
				filterNode.type = 'lowpass';
				filterNode.Q.setValueAtTime(8, now);
				filterNode.frequency.setValueAtTime(400, now);
				filterNode.frequency.exponentialRampToValueAtTime(80, now + 0.35);

				const gainNode = ctx.createGain();
				gainNode.gain.setValueAtTime(0.8, now);
				gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

				noiseNode.connect(filterNode);
				filterNode.connect(gainNode);
				gainNode.connect(masterGain);

				noiseNode.start(now);
				noiseNode.stop(now + 0.35);
				break;
			}
			case 'shuffle': {
				for (let i = 0; i < 6; i++) {
					const osc = ctx.createOscillator();
					const delay = i * 0.035;
					osc.type = 'triangle';
					osc.frequency.setValueAtTime(260 + i * 70, now + delay);

					const gainNode = ctx.createGain();
					gainNode.gain.setValueAtTime(0.01, now + delay);
					gainNode.gain.exponentialRampToValueAtTime(0.24, now + delay + 0.012);
					gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.12);

					osc.connect(gainNode);
					gainNode.connect(masterGain);
					osc.start(now + delay);
					osc.stop(now + delay + 0.14);
				}
				break;
			}
			case 'victory': {
				// Happy triumphant major chord melody
				const notes = [261.63, 329.63, 392.0, 523.25]; // C4, E4, G4, C5
				const duration = 0.12;

				notes.forEach((freq, index) => {
					const osc = ctx.createOscillator();
					const delay = index * 0.08;
					osc.type = 'triangle';
					osc.frequency.setValueAtTime(freq, now + delay);

					const gainNode = ctx.createGain();
					gainNode.gain.setValueAtTime(0.01, now + delay);
					gainNode.gain.exponentialRampToValueAtTime(0.5, now + delay + 0.02);
					gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + duration + 0.1);

					osc.connect(gainNode);
					gainNode.connect(masterGain);

					osc.start(now + delay);
					osc.stop(now + delay + duration + 0.1);
				});
				break;
			}
			case 'defeat': {
				// Sad descending minor chord
				const notes = [311.13, 293.66, 261.63]; // Eb4, D4, C4
				const duration = 0.25;

				notes.forEach((freq, index) => {
					const osc = ctx.createOscillator();
					const delay = index * 0.18;
					osc.type = 'sawtooth';
					osc.frequency.setValueAtTime(freq, now + delay);

					const gainNode = ctx.createGain();
					gainNode.gain.setValueAtTime(0.01, now + delay);
					gainNode.gain.exponentialRampToValueAtTime(0.4, now + delay + 0.05);
					gainNode.gain.exponentialRampToValueAtTime(0.01, now + delay + duration + 0.1);

					osc.connect(gainNode);
					gainNode.connect(masterGain);

					osc.start(now + delay);
					osc.stop(now + delay + duration + 0.1);
				});
				break;
			}
		}
	} catch (err) {
		console.warn('Web Audio synthesis error: ', err);
	}
}
