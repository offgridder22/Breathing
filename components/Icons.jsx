/* Minimal line-drawn SVG icons — same visual language as scene pill icons */

const props = {
  width: 14,
  height: 14,
  viewBox: '0 0 14 14',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.15',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
};

/* ♫ double note — sound on */
export function IconSoundOn() {
  return (
    <svg {...props}>
      <ellipse cx="3.8" cy="11" rx="2.2" ry="1.5" />
      <ellipse cx="9.5" cy="9.5" rx="2.2" ry="1.5" />
      <line x1="5.9" y1="10.4" x2="5.9" y2="3.8" />
      <line x1="11.6" y1="8.9" x2="11.6" y2="2.3" />
      <line x1="5.9" y1="3.8" x2="11.6" y2="2.3" />
    </svg>
  );
}

/* ♪ single note — sound off */
export function IconSoundOff() {
  return (
    <svg {...props}>
      <ellipse cx="5" cy="11" rx="2.2" ry="1.5" />
      <line x1="7.1" y1="10.4" x2="7.1" y2="3" />
      <path d="M7.1 3 Q12 4.5 10.5 8.5" />
    </svg>
  );
}

/* ⛶ four corner brackets — expand / enter fullscreen */
export function IconExpand() {
  return (
    <svg {...props}>
      <path d="M1 5V1H5" />
      <path d="M9 1H13V5" />
      <path d="M1 9V13H5" />
      <path d="M9 13H13V9" />
    </svg>
  );
}

/* ✕ cross — exit fullscreen */
export function IconClose() {
  return (
    <svg {...props}>
      <line x1="2.5" y1="2.5" x2="11.5" y2="11.5" />
      <line x1="11.5" y1="2.5" x2="2.5" y2="11.5" />
    </svg>
  );
}
