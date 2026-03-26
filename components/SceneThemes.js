export const sceneThemes = {
  dawn: {
    label: '4 \u00b7 4 \u00b7 6 \u00b7 2 \u2014 Box Breathing',
    guide: 'Inhale through the nose, hold, exhale through the mouth. Let each cycle return you to now.',
    words: ['breathe', 'soften', 'let go', 'be here', 'slow down', 'arrive', 'settle', 'release', 'presence', 'stillness'],
    phases: [
      { name: 'inhale', duration: 4, anim: 'inhale' },
      { name: 'hold', duration: 4, anim: 'hold' },
      { name: 'exhale', duration: 6, anim: 'exhale' },
      { name: 'rest', duration: 2, anim: 'rest' },
    ],
  },
  forest: {
    label: '4 \u00b7 7 \u00b7 8 \u2014 Forest Breath',
    guide: 'Breathe in slowly like roots drawing water. Hold. Release like wind through leaves.',
    words: ['roots', 'earth', 'alive', 'grounded', 'wild', 'deep', 'ancient', 'grow', 'open', 'forest'],
    phases: [
      { name: 'inhale', duration: 4, anim: 'inhale' },
      { name: 'hold', duration: 7, anim: 'hold' },
      { name: 'exhale', duration: 8, anim: 'exhale' },
      { name: 'rest', duration: 2, anim: 'rest' },
    ],
  },
  ocean: {
    label: '5 \u00b7 0 \u00b7 5 \u2014 Ocean Wave',
    guide: 'Breathe like the tide \u2014 no holding, no forcing. In and out, endlessly returning.',
    words: ['wave', 'vast', 'drift', 'deep blue', 'horizon', 'flow', 'tide', 'open sea', 'weightless', 'surrender'],
    phases: [
      { name: 'inhale', duration: 5, anim: 'inhale' },
      { name: 'hold', duration: 1, anim: 'hold' },
      { name: 'exhale', duration: 5, anim: 'exhale' },
      { name: 'rest', duration: 1, anim: 'rest' },
    ],
  },
  dusk: {
    label: '4 \u00b7 4 \u00b7 8 \u2014 Golden Rest',
    guide: 'Each exhale is a quiet surrender. Let the day dissolve with every breath out.',
    words: ['golden', 'warmth', 'dissolve', 'dim light', 'rest now', 'enough', 'tender', 'close', 'grateful', 'peace'],
    phases: [
      { name: 'inhale', duration: 4, anim: 'inhale' },
      { name: 'hold', duration: 4, anim: 'hold' },
      { name: 'exhale', duration: 8, anim: 'exhale' },
      { name: 'rest', duration: 2, anim: 'rest' },
    ],
  },
};

export const sceneConfigs = {
  dawn:   { b1: 'rgba(160,210,220,0.25)', b2: 'rgba(220,200,170,0.2)',  accent: '#C5BD7E', accentDark: '#9a9050' },
  forest: { b1: 'rgba(100,180,120,0.25)', b2: 'rgba(140,190,130,0.2)',  accent: '#3d6b50', accentDark: '#2a5038' },
  ocean:  { b1: 'rgba(60,140,200,0.3)',   b2: 'rgba(80,160,210,0.2)',   accent: '#2a6090', accentDark: '#1a4870' },
  dusk:   { b1: 'rgba(220,140,80,0.25)',  b2: 'rgba(200,120,70,0.2)',   accent: '#b85a10', accentDark: '#904000' },
};

export const sceneTransitionColors = {
  dawn:   'rgba(232,216,200,0.55)',
  forest: 'rgba(140,200,160,0.45)',
  ocean:  'rgba(100,180,220,0.45)',
  dusk:   'rgba(220,160,80,0.5)',
};

export const quotes = [
  { text: 'The quieter you become, the more you can hear.', author: 'Ram Dass' },
  { text: 'Breath is the bridge between life and consciousness.', author: 'Thich Nhat Hanh' },
  { text: 'Within you, there is a stillness and a sanctuary.', author: 'Hermann Hesse' },
  { text: 'Almost everything will work again if you unplug it.', author: 'Anne Lamott' },
  { text: 'The present moment is the only moment available.', author: 'Thich Nhat Hanh' },
  { text: 'Inhale the future, exhale the past.', author: 'Unknown' },
  { text: 'In the midst of chaos, keep stillness inside of you.', author: 'Deepak Chopra' },
  { text: 'Peace comes from within. Do not seek it without.', author: 'Buddha' },
  { text: 'Nature does not hurry, yet everything is accomplished.', author: 'Lao Tzu' },
  { text: 'Stop letting your thoughts control you.', author: 'Dan Millman' },
];

export const sectionScenes = ['dawn', 'forest', 'ocean', 'dusk'];
export const sectionIds = ['s-hero', 's-breathe', 's-journey', 's-close'];

export const journeyCards = [
  { scene: 'dawn',   name: 'Dawn',   desc: 'soft light \u00b7 morning stillness \u00b7 awakening', duration: '5 min' },
  { scene: 'forest', name: 'Forest', desc: 'deep green \u00b7 grounding \u00b7 slow exhale',       duration: '8 min' },
  { scene: 'ocean',  name: 'Ocean',  desc: 'open horizon \u00b7 rhythm \u00b7 clarity',            duration: '10 min' },
  { scene: 'dusk',   name: 'Dusk',   desc: 'warm amber \u00b7 release \u00b7 rest',                duration: '6 min' },
];
