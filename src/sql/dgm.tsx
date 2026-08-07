// SQL-specific drawing helpers on top of the shared kit in src/content/dgm.tsx.
// The shared primitives are re-exported, so a topic file only imports '../dgm'.

import type { DC } from '../content/dgm';

export * from '../content/dgm';

const STROKE: Record<DC, string> = {
  a: 'var(--accent)',
  b: 'var(--accent-2)',
  c: 'var(--accent-3)',
  n: 'var(--ink-faint)',
};
const FILL: Record<DC, string> = {
  a: 'var(--accent-soft)',
  b: 'var(--accent-2-soft)',
  c: 'var(--accent-3-soft)',
  n: 'var(--surface-2)',
};

/**
 * Two overlapping circles with the kept region shaded — the standard way to
 * show what each join type returns.
 *
 * `keep` selects the shaded area: 'inner' is the overlap only, 'left' is the
 * left circle, 'right' the right, 'full' both, and 'leftOnly'/'rightOnly' are
 * the anti-join variants that exclude the overlap.
 */
export function Venn({
  x,
  y,
  r = 40,
  keep,
  label,
  a = 'A',
  b = 'B',
}: {
  x: number;
  y: number;
  r?: number;
  keep: 'inner' | 'left' | 'right' | 'full' | 'leftOnly' | 'rightOnly';
  label: string;
  a?: string;
  b?: string;
}) {
  // Circle centres, overlapping by r.
  const lx = x + r * 0.72;
  const rx = x + r * 2 * 0.98;
  const cy = y + r;
  const id = `clip-${keep}-${Math.round(x)}-${Math.round(y)}`;
  const shade = 'var(--accent-soft)';
  const edge = 'var(--accent)';

  return (
    <g>
      <defs>
        <clipPath id={`${id}-L`}>
          <circle cx={lx} cy={cy} r={r} />
        </clipPath>
        <clipPath id={`${id}-R`}>
          <circle cx={rx} cy={cy} r={r} />
        </clipPath>
      </defs>

      {/* Shaded regions, built by clipping one circle against the other. */}
      {(keep === 'left' || keep === 'full' || keep === 'leftOnly') && (
        <circle cx={lx} cy={cy} r={r} fill={shade} />
      )}
      {(keep === 'right' || keep === 'full' || keep === 'rightOnly') && (
        <circle cx={rx} cy={cy} r={r} fill={shade} />
      )}
      {keep === 'inner' && (
        <g clipPath={`url(#${id}-L)`}>
          <circle cx={rx} cy={cy} r={r} fill={shade} />
        </g>
      )}
      {/* Anti-joins: punch the overlap back out with the page background. */}
      {(keep === 'leftOnly' || keep === 'rightOnly') && (
        <g clipPath={`url(#${id}-L)`}>
          <circle cx={rx} cy={cy} r={r} fill="var(--surface-2)" />
        </g>
      )}

      <circle cx={lx} cy={cy} r={r} fill="none" stroke={edge} strokeWidth="1.6" />
      <circle cx={rx} cy={cy} r={r} fill="none" stroke={edge} strokeWidth="1.6" />
      <text x={lx - r * 0.45} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">
        {a}
      </text>
      <text x={rx + r * 0.45} y={cy + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">
        {b}
      </text>
      <text
        x={x + r * 1.7}
        y={y + r * 2 + 22}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="var(--ink)"
      >
        {label}
      </text>
    </g>
  );
}

/** Width a <Venn> occupies, including its caption. */
export const vennW = (r = 40) => r * 3.4;

/** One stage in the query execution pipeline. */
export function Stage({
  x,
  y,
  w = 92,
  h = 40,
  label,
  sub,
  c = 'a',
  dim,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  c?: DC;
  /** Draw it faded — used for the clauses you write but which run later. */
  dim?: boolean;
}) {
  return (
    <g opacity={dim ? 0.45 : 1}>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={FILL[c]} stroke={STROKE[c]} strokeWidth="1.5" />
      <text
        x={x + w / 2}
        y={y + (sub ? h / 2 - 4 : h / 2 + 4)}
        textAnchor="middle"
        fontSize="11.5"
        fontWeight="800"
        fontFamily="var(--font-mono)"
        fill={STROKE[c]}
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" fontSize="9" fill="var(--ink-soft)">
          {sub}
        </text>
      )}
    </g>
  );
}
