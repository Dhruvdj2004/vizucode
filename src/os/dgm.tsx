// OS-specific drawing helpers, layered on the shared kit in src/content/dgm.tsx.
//
// The shared primitives (Dg, Box, Arrow, Txt, Frame, Rel …) are re-exported, so
// a topic file only ever imports from '../dgm'.

import type { DC } from '../content/dgm';
import { Txt } from '../content/dgm';

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

/** One slice of CPU time on a Gantt chart. */
export interface Slice {
  label: string;
  start: number;
  end: number;
  c?: DC;
}

/**
 * CPU scheduling Gantt chart: labelled slices with the time scale underneath.
 * `px` is pixels per time unit, so several charts stacked in one diagram stay
 * comparable.
 */
export function Gantt({
  x,
  y,
  slices,
  px = 22,
  h = 34,
  title,
  ticks = 'edges',
}: {
  x: number;
  y: number;
  slices: Slice[];
  px?: number;
  h?: number;
  title?: string;
  /** 'edges' labels every slice boundary; 'none' hides the time scale. */
  ticks?: 'edges' | 'none';
}) {
  const t0 = slices.length ? slices[0].start : 0;
  const at = (t: number) => x + (t - t0) * px;
  const edges = Array.from(new Set(slices.flatMap((s) => [s.start, s.end]))).sort((a, b) => a - b);

  return (
    <g>
      {title && (
        <text x={x} y={y - 8} fontSize="12" fontWeight="800" fill="var(--ink)">
          {title}
        </text>
      )}
      {slices.map((s, i) => {
        const w = (s.end - s.start) * px;
        const c = s.c ?? (s.label.toLowerCase().startsWith('idle') ? 'n' : 'a');
        return (
          <g key={i}>
            <rect x={at(s.start)} y={y} width={w} height={h} fill={FILL[c]} stroke={STROKE[c]} strokeWidth="1.4" />
            <text
              x={at(s.start) + w / 2}
              y={y + h / 2 + 4}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill={INK[c]}
            >
              {w >= 18 ? s.label : ''}
            </text>
          </g>
        );
      })}
      {ticks === 'edges' &&
        edges.map((t) => (
          <g key={`t${t}`}>
            <line x1={at(t)} y1={y + h} x2={at(t)} y2={y + h + 5} stroke="var(--line)" strokeWidth="1" />
            <text x={at(t)} y={y + h + 17} textAnchor="middle" fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--ink-faint)">
              {t}
            </text>
          </g>
        ))}
    </g>
  );
}

/** Height a <Gantt> occupies, including the time scale. */
export const ganttH = (h = 34, ticks = true) => h + (ticks ? 21 : 0);

/** A queue drawn as a row of boxes, with an optional name on the left. */
export function Queue({
  x,
  y,
  items,
  name,
  bw = 42,
  h = 28,
  c = 'b',
  gap = 4,
}: {
  x: number;
  y: number;
  items: string[];
  name?: string;
  bw?: number;
  h?: number;
  c?: DC;
  gap?: number;
}) {
  return (
    <g>
      {name && (
        <text x={x} y={y - 7} fontSize="11" fontWeight="700" fill="var(--ink-soft)">
          {name}
        </text>
      )}
      {items.map((it, i) => (
        <g key={i}>
          <rect
            x={x + i * (bw + gap)}
            y={y}
            width={bw}
            height={h}
            rx={5}
            fill={FILL[c]}
            stroke={STROKE[c]}
            strokeWidth="1.4"
          />
          <text
            x={x + i * (bw + gap) + bw / 2}
            y={y + h / 2 + 4}
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="700"
            fill={INK[c]}
          >
            {it}
          </text>
        </g>
      ))}
    </g>
  );
}

/** One region of physical memory. `hole` draws it as free space. */
export interface Region {
  label: string;
  /** Size in KB — also decides the drawn height. */
  size: number;
  c?: DC;
  hole?: boolean;
}

/**
 * A vertical memory map: regions stacked from address 0 downwards, each drawn
 * proportional to its size. Used for contiguous allocation and fragmentation.
 */
export function MemMap({
  x,
  y,
  w = 120,
  regions,
  px = 0.28,
  title,
  addr,
}: {
  x: number;
  y: number;
  w?: number;
  regions: Region[];
  /** Pixels per KB. */
  px?: number;
  title?: string;
  /** Show running addresses down the left edge. */
  addr?: boolean;
}) {
  let cy = y;
  let a = 0;
  return (
    <g>
      {title && (
        <text x={x + w / 2} y={y - 9} textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--ink)">
          {title}
        </text>
      )}
      {regions.map((r, i) => {
        const h = Math.max(20, r.size * px);
        const top = cy;
        const start = a;
        cy += h;
        a += r.size;
        const c = r.c ?? (r.hole ? 'n' : 'b');
        return (
          <g key={i}>
            <rect
              x={x}
              y={top}
              width={w}
              height={h}
              fill={r.hole ? 'transparent' : FILL[c]}
              stroke={STROKE[c]}
              strokeWidth="1.4"
              strokeDasharray={r.hole ? '5 4' : undefined}
            />
            <text
              x={x + w / 2}
              y={top + h / 2 - (h > 30 ? 5 : 0) + 4}
              textAnchor="middle"
              fontSize="11.5"
              fontWeight="700"
              fill={r.hole ? 'var(--ink-faint)' : INK[c]}
            >
              {r.label}
            </text>
            {h > 30 && (
              <text x={x + w / 2} y={top + h / 2 + 13} textAnchor="middle" fontSize="10" fill="var(--ink-soft)">
                {r.size} KB
              </text>
            )}
            {addr && (
              <text
                x={x - 6}
                y={top + 4}
                textAnchor="end"
                fontSize="9.5"
                fontFamily="var(--font-mono)"
                fill="var(--ink-faint)"
              >
                {start}K
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Total height a <MemMap> will occupy. */
export const memH = (regions: Region[], px = 0.28) =>
  regions.reduce((a, r) => a + Math.max(20, r.size * px), 0);

/**
 * Disk head movement plot for the scheduling algorithms: cylinder number along
 * the top, one row per service, head path drawn downwards.
 */
export function SeekChart({
  x,
  y,
  w = 480,
  seq,
  max = 200,
  rowH = 20,
  c = 'a',
  title,
}: {
  x: number;
  y: number;
  w?: number;
  /** Head positions in service order; seq[0] is the starting cylinder. */
  seq: number[];
  max?: number;
  rowH?: number;
  c?: DC;
  title?: string;
}) {
  const at = (cyl: number) => x + (cyl / max) * w;
  const rowY = (i: number) => y + 22 + i * rowH;
  const total = seq.slice(1).reduce((a, v, i) => a + Math.abs(v - seq[i]), 0);

  return (
    <g>
      {title && (
        <text x={x} y={y - 10} fontSize="12" fontWeight="800" fill="var(--ink)">
          {title}
        </text>
      )}
      {/* cylinder axis */}
      <line x1={x} y1={y + 12} x2={x + w} y2={y + 12} stroke="var(--line)" strokeWidth="1.2" />
      {[0, max / 4, max / 2, (3 * max) / 4, max].map((t) => (
        <text key={t} x={at(t)} y={y + 4} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--ink-faint)">
          {t}
        </text>
      ))}

      {seq.map((cyl, i) => (
        <g key={i}>
          {i > 0 && (
            <line
              x1={at(seq[i - 1])}
              y1={rowY(i - 1)}
              x2={at(cyl)}
              y2={rowY(i)}
              stroke={STROKE[c]}
              strokeWidth="1.6"
            />
          )}
          <circle cx={at(cyl)} cy={rowY(i)} r={4} fill={STROKE[c]} />
          <text
            x={at(cyl)}
            y={rowY(i) - 7}
            textAnchor="middle"
            fontSize="9.5"
            fontFamily="var(--font-mono)"
            fill={i === 0 ? 'var(--ink-soft)' : INK[c]}
          >
            {cyl}
          </text>
        </g>
      ))}

      <Txt x={x} y={rowY(seq.length - 1) + 22} fs={11.5} bold c={c} anchor="start">
        {`Total head movement = ${total} cylinders`}
      </Txt>
    </g>
  );
}

/** Height a <SeekChart> occupies. */
export const seekH = (n: number, rowH = 20) => 22 + n * rowH + 26;
