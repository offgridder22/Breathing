# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

Open `breathing.html` directly in any modern web browser — no build step, no dependencies, no server required.

## Architecture

This is a single-file web application (`breathing.html`) with all CSS and JavaScript inline. There is no build system, no framework, and no package manager.

### Core Systems

**Scene Management** — 4 environments (Dawn, Forest, Ocean, Dusk), each defined in the `sceneThemes` object with unique gradient colors, breathing patterns, and audio characteristics. Scene transitions use fade overlays.

**Breathing Engine** — Phase-based timer (inhale → hold → exhale → rest) driven by `sceneThemes` per-scene timing configs. An animated orb expands/contracts in sync with each phase and a live countdown shows the current phase duration.

**Audio (Web Audio API)** — Procedurally generated ambient sounds, no audio files. Each scene creates its own oscillator/noise graph:
- Dawn: sine tones (220Hz, 330Hz)
- Forest: bandpass-filtered noise (700Hz)
- Ocean: LFO-modulated noise (0.12Hz LFO)
- Dusk: deep drone (110Hz, 165Hz)

**Visual Layer** — Animated wave canvas (9 concentric waves), floating ambient blobs, noise grain overlay, and parallax scrolling in the hero section. All visuals respond to the active scene.

**Layout** — Scroll-based multi-section layout (Hero → Breathe → Journey → Close) with sticky nav, progress dots, and a fullscreen breathwork mode that hides chrome.

### Assets

- `plant.png` — used in the hero section
- `dandelion.png` — present but not referenced in the current HTML
