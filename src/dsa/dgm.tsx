// The shared diagram kit, plus two helpers the DSA topics need that the
// theory modules don't: round graph vertices and the edges between them.

export * from '../content/dgm';

import type { DC } from '../content/dgm';

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

/** A graph vertex: a labelled circle. */
export function GNode({
  cx,
  cy,
  label,
  c = 'a',
  r = 18,
  fs = 13,
}: {
  cx: number;
  cy: number;
  label: string | number;
  c?: DC;
  r?: number;
  fs?: number;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={FILL[c]} stroke={STROKE[c]} strokeWidth="1.8" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fs}
        fontWeight="700"
        fill={c === 'n' ? 'var(--ink)' : STROKE[c]}
      >
        {label}
      </text>
    </g>
  );
}

/** An edge between two vertex centres, trimmed so it stops at the circles. */
export function GEdge({
  x1,
  y1,
  x2,
  y2,
  c = 'n',
  r = 18,
  directed,
  w,
  dashed,
  /** Nudge the weight label off the midpoint. */
  wdx = 0,
  wdy = -6,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c?: DC;
  r?: number;
  directed?: boolean;
  /** Edge weight, drawn at the midpoint. */
  w?: string | number;
  dashed?: boolean;
  wdx?: number;
  wdy?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // Leave a little extra room on the head end so the arrowhead clears the circle.
  const sx = x1 + ux * r;
  const sy = y1 + uy * r;
  const ex = x2 - ux * (r + (directed ? 5 : 0));
  const ey = y2 - uy * (r + (directed ? 5 : 0));
  return (
    <g>
      <path
        d={`M ${sx} ${sy} L ${ex} ${ey}`}
        fill="none"
        stroke={STROKE[c]}
        strokeWidth="1.8"
        strokeDasharray={dashed ? '5 4' : undefined}
        markerEnd={directed ? `url(#dg-head-${c})` : undefined}
      />
      {w !== undefined && (
        <text
          x={(x1 + x2) / 2 + wdx}
          y={(y1 + y2) / 2 + wdy}
          textAnchor="middle"
          fontSize="11.5"
          fontWeight="700"
          fill="var(--accent-3)"
        >
          {w}
        </text>
      )}
    </g>
  );
}
