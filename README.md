# Candy Crush Clone

A high-fidelity Match-3 game clone built using SvelteKit, TypeScript, and the Web Audio API.

## Features

- **Core Gameplay Loop**: Classic Match-3 mechanics including swapping, cascades, special candy generation (striped, wrapped, color bombs), and combo chains.
- **Interactive Board**: Fluid drag/swipe controls with animated candy physics, particle effects, grid shake, and combo notifications.
- **Overworld Map**: Progression path mapping level completion across 20 distinct level types (score challenges, target color collections, time trials).
- **Procedural Audio**: Sound synthesis utilizing the Web Audio API for custom sweeps, chimes, explosions, and melodies.
- **State Management**: Reactive game states handled via centralized Svelte stores with progression tracking cached in localStorage.
- **Aesthetic Enhancements**: Vector candy assets, custom styling, responsive layout, and an toggleable color-blind accessibility mode.

## Tech Stack

- **Framework**: SvelteKit 2+ / Svelte 5
- **Language**: TypeScript
- **Styling**: Vanilla CSS
- **Audio**: Web Audio API
- **Build Tool**: Vite

## Getting Started

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

Clone the repository and install the project dependencies:

```bash
npm install
```

### Development

To start the local development server:

```bash
npm run dev
```

The application will be served locally. You can access it in your browser (typically at `http://localhost:5173`).

### Building

To build the project for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

### Code Verification

To run TypeScript compilation checks and Svelte validation:

```bash
npm run check
```
