// OOP-specific drawing helpers on top of the shared kit in src/content/dgm.tsx.
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
const INK: Record<DC, string> = {
  a: 'var(--accent)',
  b: 'var(--accent-2)',
  c: 'var(--accent-3)',
  n: 'var(--ink)',
};

/** A UML-ish class box: name bar on top, then one line per member. */
export function ClassBox({
  x,
  y,
  w = 150,
  name,
  members = [],
  c = 'a',
  /** Draw the name in italics, the UML convention for an abstract class. */
  abstract,
  rowH = 22,
  headH = 30,
}: {
  x: number;
  y: number;
  w?: number;
  name: string;
  members?: string[];
  c?: DC;
  abstract?: boolean;
  rowH?: number;
  headH?: number;
}) {
  const h = headH + members.length * rowH;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="var(--surface)" stroke={STROKE[c]} strokeWidth="1.6" />
      <path
        d={`M ${x} ${y + headH} V ${y + 6} a 6 6 0 0 1 6 -6 h ${w - 12} a 6 6 0 0 1 6 6 v ${headH - 6} z`}
        fill={FILL[c]}
        stroke="none"
      />
      <line x1={x} y1={y + headH} x2={x + w} y2={y + headH} stroke={STROKE[c]} strokeWidth="1.4" />
      <text
        x={x + w / 2}
        y={y + headH / 2 + 4}
        textAnchor="middle"
        fontSize="12.5"
        fontWeight="800"
        fontStyle={abstract ? 'italic' : undefined}
        fill={INK[c]}
      >
        {name}
      </text>
      {members.map((m, i) => (
        <text
          key={m + i}
          x={x + 10}
          y={y + headH + rowH * i + rowH / 2 + 4}
          fontSize="11"
          fontFamily="var(--font-mono)"
          fill="var(--ink-soft)"
        >
          {m}
        </text>
      ))}
    </g>
  );
}

/** Height a <ClassBox> occupies — handy when stacking. */
export const classH = (members: number, rowH = 22, headH = 30) => headH + members * rowH;

/**
 * The UML inheritance arrow: a line from child to parent ending in a hollow
 * triangle. `from` is the child's top edge, `to` the parent's bottom edge.
 */
export function Extends({
  x1,
  y1,
  x2,
  y2,
  c = 'n',
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c?: DC;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const tip = 11;
  // Stop the line where the triangle begins.
  const bx = x2 - ux * tip;
  const by = y2 - uy * tip;
  // Perpendicular, for the triangle's base corners.
  const px = -uy * 6.5;
  const py = ux * 6.5;
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={STROKE[c]} strokeWidth="1.5" />
      <polygon
        points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`}
        fill="var(--surface)"
        stroke={STROKE[c]}
        strokeWidth="1.5"
      />
    </g>
  );
}

/** A labelled memory cell, for the copy-semantics diagrams. */
export function Cell({
  x,
  y,
  w = 92,
  h = 34,
  label,
  sub,
  c = 'b',
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string;
  sub?: string;
  c?: DC;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={5} fill={FILL[c]} stroke={STROKE[c]} strokeWidth="1.5" />
      <text
        x={x + w / 2}
        y={y + (sub ? h / 2 - 4 : h / 2 + 4)}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill={INK[c]}
      >
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" fontSize="9.5" fill="var(--ink-soft)">
          {sub}
        </text>
      )}
    </g>
  );
}
