'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Nav, { ProgressDots } from '../components/Nav';
import HeroSection from '../components/HeroSection';
import BreatheSection from '../components/BreatheSection';
import JourneySection from '../components/JourneySection';
import CloseSection from '../components/CloseSection';
import Footer from '../components/Footer';
import {
  sectionIds,
  sceneConfigs,
  sceneTransitionColors,
} from '../components/SceneThemes';
import { playSceneSound, stopSound } from '../components/AudioEngine';
import { IconSoundOn, IconSoundOff } from '../components/Icons';

// ── Tonal anchors per theme — [r, g, b, alpha] for each section ──────────────
// 4 anchor points (hero → breathe → journey → close), same color family, subtle shift
const SECTION_TONES = {
  dawn:   [
    [232, 220, 205,  0   ],  // hero    – transparent
    [185, 205, 222,  0.20],  // breathe – cool blue-grey mist
    [228, 212, 190,  0.18],  // journey – warm golden tone
    [218, 192, 162,  0.28],  // close   – amber warmth
  ],
  forest: [
    [100, 140, 115,  0   ],
    [ 50,  95,  68,  0.22],  // breathe – deep canopy
    [ 78, 115,  72,  0.18],  // journey – mossy light
    [ 92,  72,  48,  0.28],  // close   – warm earth
  ],
  ocean:  [
    [ 75, 140, 200,  0   ],
    [ 35,  82, 158,  0.22],  // breathe – deep water
    [ 52, 118, 165,  0.18],  // journey – lighter surface
    [ 62,  50, 112,  0.28],  // close   – twilight blue-violet
  ],
  dusk:   [
    [210, 160,  90,  0   ],
    [188, 112,  48,  0.22],  // breathe – deeper amber
    [202, 138,  85,  0.18],  // journey – rose gold
    [155,  82,  38,  0.30],  // close   – dark settling brown
  ],
};

function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(t) { return t * t * (3 - 2 * t); }

function computeShade(scene, scrollY, windowH) {
  const tones = SECTION_TONES[scene] || SECTION_TONES.dawn;

  // Section edge positions (trigger point = 50% up the viewport)
  const edges = sectionIds.map(id => {
    const el = document.getElementById(id);
    return el ? el.offsetTop - windowH * 0.5 : 0;
  });

  // Determine which two anchors we interpolate between
  let fromIdx = 0;
  for (let i = edges.length - 1; i >= 0; i--) {
    if (scrollY >= edges[i]) { fromIdx = i; break; }
  }
  const toIdx = Math.min(fromIdx + 1, tones.length - 1);

  let t = 0;
  if (fromIdx < toIdx) {
    const range = edges[toIdx] - edges[fromIdx];
    t = range > 0 ? smoothstep(Math.max(0, Math.min(1, (scrollY - edges[fromIdx]) / range))) : 0;
  }

  const c1 = tones[fromIdx];
  const c2 = tones[toIdx];
  const r = Math.round(lerp(c1[0], c2[0], t));
  const g = Math.round(lerp(c1[1], c2[1], t));
  const b = Math.round(lerp(c1[2], c2[2], t));
  const a = +lerp(c1[3], c2[3], t).toFixed(3);

  return `rgba(${r},${g},${b},${a})`;
}

export default function Home() {
  const [currentScene, setCurrentScene] = useState('dawn');
  const [activeSection, setActiveSection] = useState(0);
  const [userChosenScene, setUserChosenScene] = useState(null);
  const [soundOn, setSoundOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sweeping, setSweeping] = useState(false);
  const [sweepColor, setSweepColor] = useState('');
  const currentSceneRef = useRef(currentScene);
  currentSceneRef.current = currentScene;

  // Scene change logic
  const changeScene = useCallback((name, withSound) => {
    if (name === currentSceneRef.current) return;

    setSweepColor(sceneTransitionColors[name]);
    setSweeping(true);
    setTimeout(() => setSweeping(false), 500);

    setCurrentScene(name);

    const c = sceneConfigs[name];
    document.documentElement.style.setProperty('--accent', c.accent);
    document.documentElement.style.setProperty('--accent-dark', c.accentDark);

    const b1 = document.getElementById('blob1');
    const b2 = document.getElementById('blob2');
    if (b1) b1.style.background = `radial-gradient(circle, ${c.b1}, transparent 70%)`;
    if (b2) b2.style.background = `radial-gradient(circle, ${c.b2}, transparent 70%)`;

    if (withSound) playSceneSound(name);

    // Recalculate shade for the new theme at current scroll position
    document.documentElement.style.setProperty(
      '--section-shade',
      computeShade(name, window.scrollY, window.innerHeight)
    );
  }, []);

  // Scroll tracking
  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;

      // Active section (for nav dots)
      let active = 0;
      sectionIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && scrollY >= el.offsetTop - windowH * 0.4) active = i;
      });
      setActiveSection(active);

      // Continuous tonal shade
      document.documentElement.style.setProperty(
        '--section-shade',
        computeShade(currentSceneRef.current, scrollY, windowH)
      );

      // Parallax
      const hero = document.getElementById('s-hero');
      if (hero && scrollY <= hero.offsetHeight) {
        document.querySelectorAll('.hero-parallax-bg').forEach(el => {
          el.style.transform = `translateY(${scrollY * 0.12}px)`;
        });
        document.querySelectorAll('.hero-parallax-mid').forEach(el => {
          el.style.transform = `translateY(${scrollY * 0.22}px)`;
        });
        document.querySelectorAll('.hero-parallax-fg').forEach(el => {
          el.style.transform = `translateY(${scrollY * 0.32}px)`;
        });
        const plant = document.querySelector('.flower-scene');
        if (plant) plant.style.transform = `translateY(${scrollY * 0.08}px)`;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [soundOn, changeScene]);

  // Init CSS vars + blobs on mount
  useEffect(() => {
    const c = sceneConfigs['dawn'];
    document.documentElement.style.setProperty('--accent', c.accent);
    document.documentElement.style.setProperty('--accent-dark', c.accentDark);
    document.documentElement.style.setProperty('--section-shade', 'rgba(0,0,0,0)');
    setTimeout(() => {
      const b1 = document.getElementById('blob1');
      const b2 = document.getElementById('blob2');
      if (b1) b1.style.opacity = '1';
      if (b2) b2.style.opacity = '1';
    }, 500);
  }, []);

  function scrollToSection(i) {
    document.getElementById(sectionIds[i])?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleChooseJourney(scene) {
    setUserChosenScene(scene);
    changeScene(scene, soundOn);
    setTimeout(() => scrollToSection(1), 300);
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    if (next) playSceneSound(currentScene);
    else stopSound();
  }

  function toggleFullscreen() {
    const next = !isFullscreen;
    setIsFullscreen(next);
    if (next) {
      document.body.classList.add('is-fullscreen');
      scrollToSection(1);
    } else {
      document.body.classList.remove('is-fullscreen');
    }
  }

  function closeFullscreen() {
    setIsFullscreen(false);
    document.body.classList.remove('is-fullscreen');
  }

  return (
    <>
      {/* Scene backgrounds */}
      <div className="scene-layer" id="scene-dawn"   style={{ opacity: currentScene === 'dawn'   ? 1 : 0 }} />
      <div className="scene-layer" id="scene-forest" style={{ opacity: currentScene === 'forest' ? 1 : 0 }} />
      <div className="scene-layer" id="scene-ocean"  style={{ opacity: currentScene === 'ocean'  ? 1 : 0 }} />
      <div className="scene-layer" id="scene-dusk"   style={{ opacity: currentScene === 'dusk'   ? 1 : 0 }} />

      {/* Ambient blobs */}
      <div className="ambient" id="blob1" />
      <div className="ambient" id="blob2" />

      {/* Section shade — continuous tonal overlay driven by scroll */}
      <div id="section-shade" />

      {/* Overlays */}
      <div id="fs-close-overlay" onClick={closeFullscreen} />
      <div
        id="scene-transition"
        className={sweeping ? 'sweeping' : ''}
        style={{ background: sweepColor }}
      />

      {/* Sound toggle */}
      <button
        className={`sound-btn ${soundOn ? 'active' : ''}`}
        onClick={toggleSound}
      >
        {soundOn ? <IconSoundOn /> : <IconSoundOff />}
      </button>

      {/* Navigation */}
      <Nav activeSection={activeSection} onNavigate={scrollToSection} />
      <ProgressDots activeSection={activeSection} onNavigate={scrollToSection} />

      {/* Main content */}
      <main>
        <HeroSection
          scene={currentScene}
          onBegin={() => scrollToSection(1)}
          onSceneChange={name => changeScene(name, soundOn)}
        />
        <BreatheSection
          scene={currentScene}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
        <JourneySection onChoose={handleChooseJourney} />
        <CloseSection />
      </main>

      <Footer />
    </>
  );
}
