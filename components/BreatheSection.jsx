'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import WaveCanvas from './WaveCanvas';
import { sceneThemes } from './SceneThemes';
import { IconExpand, IconClose } from './Icons';

export default function BreatheSection({ scene, onToggleFullscreen, isFullscreen }) {
  const theme = sceneThemes[scene];
  const [breathing, setBreathing] = useState(false);
  const [phaseText, setPhaseText] = useState(theme.words[0]);
  const [count, setCount] = useState(null);
  const [orbClass, setOrbClass] = useState('');
  const [fadeOut, setFadeOut] = useState(false);
  const [label, setLabel] = useState(theme.label);
  const [guide, setGuide] = useState(theme.guide);

  const breathingRef = useRef(false);
  const breathTimeoutRef = useRef(undefined);
  const countIntervalRef = useRef(undefined);
  const idleIntervalRef = useRef(undefined);
  const idleIndexRef = useRef(0);
  const phasesRef = useRef(theme.phases);

  // Update theme when scene changes
  useEffect(() => {
    const t = sceneThemes[scene];
    phasesRef.current = t.phases;
    // Fade label and guide
    setLabel(t.label);
    setGuide(t.guide);
    if (!breathingRef.current) {
      idleIndexRef.current = 0;
      setPhaseText(t.words[0]);
    }
  }, [scene]);

  // Idle carousel
  useEffect(() => {
    if (breathing) return;
    const words = sceneThemes[scene].words;
    idleIndexRef.current = 0;
    setPhaseText(words[0]);

    idleIntervalRef.current = setInterval(() => {
      if (breathingRef.current) return;
      setFadeOut(true);
      setTimeout(() => {
        idleIndexRef.current = (idleIndexRef.current + 1) % words.length;
        setPhaseText(words[idleIndexRef.current]);
        setFadeOut(false);
      }, 600);
    }, 2800);

    return () => clearInterval(idleIntervalRef.current);
  }, [breathing, scene]);

  const runPhase = useCallback((idx) => {
    const phases = phasesRef.current;
    const phase = phases[idx];
    setOrbClass(phase.anim);
    setPhaseText(phase.name);
    let remaining = phase.duration;
    setCount(remaining);

    clearInterval(countIntervalRef.current);
    countIntervalRef.current = setInterval(() => {
      remaining--;
      setCount(remaining <= 0 ? null : remaining);
      if (remaining <= 0) clearInterval(countIntervalRef.current);
    }, 1000);

    breathTimeoutRef.current = setTimeout(() => {
      if (breathingRef.current) {
        const next = (idx + 1) % phases.length;
        runPhase(next);
      }
    }, phase.duration * 1000);
  }, []);

  const toggleBreathing = useCallback(() => {
    if (breathingRef.current) {
      breathingRef.current = false;
      setBreathing(false);
      clearTimeout(breathTimeoutRef.current);
      clearInterval(countIntervalRef.current);
      setOrbClass('');
      setCount(null);
    } else {
      breathingRef.current = true;
      setBreathing(true);
      clearInterval(idleIntervalRef.current);
      runPhase(0);
    }
  }, [runPhase]);

  return (
    <section id="s-breathe">
      <WaveCanvas scene={scene} phase={orbClass} />
      <button
        className="fullscreen-btn"
        onClick={onToggleFullscreen}
        title={isFullscreen ? 'Fermer' : 'Plein écran'}
      >
        {isFullscreen ? <IconClose /> : <IconExpand />}
      </button>

      <div className="breathe-center">
        <p className="breathe-label">{label}</p>

        <div className="breathe-wrap">
          <div className={`breathe-orb ${orbClass}`} onClick={toggleBreathing}>
            <div className="orb-text">
              <span className={`orb-phase ${fadeOut ? 'fade-out' : ''}`}>{phaseText}</span>
              <span className="orb-count">{count ?? ''}</span>
            </div>
          </div>
        </div>

        <div className="breathe-guide">
          <p>{guide}</p>
        </div>
      </div>
    </section>
  );
}
