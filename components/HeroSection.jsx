'use client';

import { useState, useEffect, useRef } from 'react';
import WindyLandscape from './WindyLandscape';

const sceneImages = {
  dawn:   { src: '/images/dawn.png',    aspectRatio: 0,     mobileAspectRatio: 1.0 },
  forest: { src: '/images/forest.png',  aspectRatio: 0,     mobileAspectRatio: 1.0 },
  ocean:  { src: '/images/ocean.png',   aspectRatio: -2.5,  mobileAspectRatio: 1.0 },
  dusk:   { src: '/images/desert.png',  aspectRatio: -2.25, mobileAspectRatio: 0   },
};

const SCENES = ['dawn', 'forest', 'ocean', 'dusk'];

export default function HeroSection({ scene = 'dawn', onBegin, onSceneChange }) {
  const [activeScene, setActiveScene]    = useState(scene);
  const [prevScene, setPrevScene]        = useState(null);
  const [isTransitioning, setTransition] = useState(false);
  const timerRef       = useRef(null);
  const prevSceneValue = useRef(scene);
  const loadTimers     = useRef([]);

  // 'hidden' → 'load' (triggers animation) → '' (settled)
  const [loadClass, setLoadClass] = useState('hero-bg--hidden');

  // Initial entrance: add load class after mount so browser fires the animation
  useEffect(() => {
    const t1 = setTimeout(() => setLoadClass('hero-bg--load'), 300);
    const t2 = setTimeout(() => setLoadClass(''),              1900);
    loadTimers.current = [t1, t2];
    return () => { t1 && clearTimeout(t1); t2 && clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (scene === prevSceneValue.current) return;
    const from = prevSceneValue.current;
    prevSceneValue.current = scene;
    // Cancel load animation if user switches scene before it finishes
    loadTimers.current.forEach(clearTimeout);
    setLoadClass('');

    if (timerRef.current) clearTimeout(timerRef.current);

    setPrevScene(from);
    setActiveScene(scene);
    setTransition(true);

    timerRef.current = setTimeout(() => {
      setPrevScene(null);
      setTransition(false);
    }, 1200);

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scene]);

  function handlePillClick(s) {
    if (s === scene || isTransitioning) return;
    onSceneChange?.(s);
  }

  return (
    <section id="s-hero">

      {/* All 4 landscapes always mounted — no WebGL reload on transition */}
      {SCENES.map(s => {
        const isActive  = s === activeScene;
        const isExiting = s === prevScene;
        const classes   = [
          'hero-bg',
          isActive && isTransitioning            ? 'hero-bg--enter'  : '',
          isActive && !isTransitioning && loadClass ? loadClass       : '',
          isExiting                               ? 'hero-bg--exit'   : '',
          !isActive && !isExiting                 ? 'hero-bg--hidden' : '',
          s === 'ocean'                           ? 'hero-bg--ocean'  : '',
        ].filter(Boolean).join(' ');

        return (
          <div key={`scene-${s}`} className={classes} aria-hidden="true">
            <WindyLandscape {...sceneImages[s]} />
          </div>
        );
      })}

      <div className="hero-content">
        <p className="hero-eyebrow hero-parallax-bg">A breath. A moment. A return.</p>
        <h1 className="hero-title hero-parallax-mid">
          Still<em>ness</em><br />
          begins<br />
          <em>here.</em>
        </h1>
        <p className="hero-sub hero-parallax-mid">
          A quiet space for breathwork. Let the landscape shift around you as you settle into the rhythm of your breath.
        </p>

        {/* Atmosphere selector */}
        <div className="atmo-selector hero-parallax-fg" role="group" aria-label="Choose atmosphere">
          {SCENES.map(s => (
            <button
              key={s}
              className={`atmo-dot${scene === s ? ' atmo-dot--active' : ''}`}
              onClick={() => handlePillClick(s)}
              aria-pressed={scene === s}
              aria-label={s}
            >
              <span className="atmo-dot__label">{s}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-hint">
        <div className="scroll-line"></div>
        <span className="scroll-label">scroll</span>
      </div>
    </section>
  );
}
