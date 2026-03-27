'use client';

import { useEffect, useRef } from 'react';

const WAVE_COUNT = 9;
const MAX_RADIUS_FACTOR = 0.78;
const LINE_WIDTH_BASE = 0.5;

// speed = px/frame at 30fps | alpha = max opacity | dir: +1 expand, -1 contract
const PHASE_CONFIG = {
  '':     { speed: 0.50, alpha: 0.38, dir:  1.0 }, // idle — ambient slow loop
  inhale: { speed: 0.28, alpha: 0.58, dir:  1.0 }, // expand outward
  hold:   { speed: 0.03, alpha: 0.32, dir:  1.0 }, // almost still
  exhale: { speed: 0.22, alpha: 0.48, dir: -1.0 }, // contract inward
  rest:   { speed: 0.05, alpha: 0.22, dir:  1.0 }, // settle, near silence
};

function waveColor(scene, alpha) {
  const p = {
    dawn:   '160,180,195',
    forest: '80,140,100',
    ocean:  '60,140,200',
    dusk:   '200,130,80',
  };
  return `rgba(${p[scene] ?? p.dawn},${alpha})`;
}

export default function WaveCanvas({ scene, phase }) {
  const canvasRef = useRef(null);
  const wavesRef  = useRef([]);
  const rafRef    = useRef(0);
  const sceneRef  = useRef(scene);
  const phaseRef  = useRef(phase ?? '');

  // Smoothly interpolated runtime state
  const speedRef = useRef(PHASE_CONFIG[''].speed);
  const alphaRef = useRef(PHASE_CONFIG[''].alpha);
  const dirRef   = useRef(PHASE_CONFIG[''].dir);

  sceneRef.current = scene;
  phaseRef.current = phase ?? '';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function initWaves() {
      const section = canvas.parentElement;
      canvas.width  = section?.offsetWidth  || window.innerWidth;
      canvas.height = section?.offsetHeight || window.innerHeight;
      const maxR = Math.hypot(canvas.width, canvas.height) * 0.5 * MAX_RADIUS_FACTOR;
      const gap = maxR / WAVE_COUNT;
      wavesRef.current = Array.from({ length: WAVE_COUNT }, (_, i) => ({
        r: i * gap,
        maxR,
      }));
    }

    let lastFrame = 0;
    const FRAME_INTERVAL = 1000 / 30;

    function loop(ts) {
      rafRef.current = requestAnimationFrame(loop);
      if (ts - lastFrame < FRAME_INTERVAL) return;
      lastFrame = ts;

      const key = phaseRef.current in PHASE_CONFIG ? phaseRef.current : '';
      const cfg = PHASE_CONFIG[key];

      // Lerp all parameters toward target for fluid organic transitions
      speedRef.current += (cfg.speed - speedRef.current) * 0.05;
      alphaRef.current += (cfg.alpha - alphaRef.current) * 0.05;
      dirRef.current   += (cfg.dir   - dirRef.current)   * 0.04;

      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H);

      const maxR     = Math.hypot(W, H) * 0.5 * MAX_RADIUS_FACTOR;
      const velocity = speedRef.current * dirRef.current;
      const maxAlpha = alphaRef.current;

      wavesRef.current.forEach(wave => {
        wave.r += velocity;

        // Wrap: expanding waves restart from center, contracting from edge
        if (velocity >= 0 && wave.r > maxR) wave.r = 0;
        if (velocity <  0 && wave.r < 0)   wave.r = maxR;

        const progress = Math.max(0, Math.min(1, wave.r / maxR));

        // Soft fade in from center, fade out toward edge
        let a = maxAlpha;
        if (progress < 0.05)      a = (progress / 0.05) * maxAlpha;
        else if (progress > 0.82) a = (1 - (progress - 0.82) / 0.18) * maxAlpha;
        a = Math.max(0, a);

        // Thinner as they expand
        const lw = LINE_WIDTH_BASE * (1 - progress * 0.55);

        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, wave.r), 0, Math.PI * 2);
        ctx.strokeStyle = waveColor(sceneRef.current, a);
        ctx.lineWidth = lw;
        ctx.stroke();
      });
    }

    initWaves();
    rafRef.current = requestAnimationFrame(loop);

    window.addEventListener('resize', initWaves);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', initWaves);
    };
  }, []);

  return <canvas ref={canvasRef} id="wave-canvas" />;
}
