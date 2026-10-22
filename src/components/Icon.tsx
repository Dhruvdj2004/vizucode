// VizuCode's own icon set: simple 24×24 line icons, one stroke weight, drawn
// to sit on the text baseline. Used instead of emoji so every icon matches.
import type { CSSProperties, ReactNode } from 'react';

const PATHS: Record<string, ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  unlock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 7.6-1.8" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.5" />
      <path d="M5 5.5v13c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-13M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  shapes: (
    <>
      <circle cx="7.5" cy="7.5" r="3.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <path d="M7.5 13.5l4 7h-8zM16.5 13.5l3.5 3.5-3.5 3.5-3.5-3.5z" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  layers: <path d="M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5" />,
  book: <path d="M5 19.5v-15A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zm0 0A1.5 1.5 0 0 0 6.5 21H19M9 7.5h6" />,
  calc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8.5 7h7M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" />
    </>
  ),
  code: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />,
  'file-text': <path d="M6 3h8l5 5v13H6zM14 3v5h5M9 13h6M9 17h6" />,
  file: <path d="M6 3h8l5 5v13H6zM14 3v5h5" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  shuffle: (
    <path d="M3 7h4c2 0 3.2 1 4.2 2.6l2.6 4.8c1 1.6 2.2 2.6 4.2 2.6h3M18 14l3 3-3 3M3 17h4c1.4 0 2.4-.5 3.2-1.4M14.3 8.4C15 7.5 16 7 17.5 7H21M18 4l3 3-3 3" />
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18" />
    </>
  ),
  flame: (
    <path d="M12 21c3.9 0 7-2.7 7-6.6 0-3.1-2-5.3-3.6-7-.4 2-1.4 3.1-2.6 3.6C12.9 7.4 11.6 4.6 9 3c.2 2.8-1.1 4.6-2.6 6.3C5.1 10.8 5 12.3 5 14.4 5 18.3 8.1 21 12 21z" />
  ),
  'skip-back': (
    <>
      <path d="M18 6v12l-8.5-6z" fill="currentColor" />
      <path d="M6 6v12" />
    </>
  ),
  play: <path d="M8 5.5v13l10-6.5z" fill="currentColor" />,
  pause: <path d="M8.5 5v14M15.5 5v14" />,
  timer: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 9.5v4l2.5 2M9.5 3h5" />
    </>
  ),
  refresh: <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4.5h-4.5" />,
  undo: <path d="M4 12a8 8 0 1 0 2.3-5.7M4 4v4.5h4.5" />,
  chevron: <path d="M9 6l6 6-6 6" />,
  'arrow-down': <path d="M12 4v15M6 13l6 6 6-6" />,
  'arrow-right': <path d="M4 12h15M13 6l6 6-6 6" />,
  'arrow-left': <path d="M20 12H5M11 6l-6 6 6 6" />,
  'arrow-up-right': <path d="M7 17L17 7M8 7h9v9" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    </>
  ),
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="1.5" />,
  volume: <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />,
  'volume-off': <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5" />,
  keyboard: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M8 14h8" />
    </>
  ),
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.8 2.8L16 9.8" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  bulb: <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />,
  hourglass: <path d="M7 3h10M7 21h10M8 3c0 4 8 5 8 9s-8 5-8 9M16 3c0 4-8 5-8 9s8 5 8 9" />,
  star: <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = '1.1em',
  className = '',
  style,
  label,
}: {
  name: IconName | string;
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  /** Accessible name; without it the icon is decorative. */
  label?: string;
}) {
  const body = PATHS[name];
  if (!body) return null;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {body}
    </svg>
  );
}

// The content data (module and aptitude category lists) still names its icons
// with an emoji; this maps each one to its drawn icon.
const FROM_EMOJI: Record<string, IconName> = {
  '🗄️': 'database',
  '⚙️': 'cpu',
  '🧩': 'shapes',
  '🌐': 'globe',
  '🔍': 'search',
  '🏗️': 'layers',
  '📗': 'book',
  '📖': 'book',
  '➗': 'calc',
  '💻': 'code',
  '📝': 'file-text',
  '🎯': 'target',
  '🔀': 'shuffle',
  '🏢': 'briefcase',
  '🔥': 'flame',
};

/** Draws the icon for an emoji from the content data (falls back to the emoji itself). */
export function EmojiIcon({ emoji, size }: { emoji: string; size?: number | string }) {
  const name = FROM_EMOJI[emoji];
  return name ? <Icon name={name} size={size} /> : <>{emoji}</>;
}
