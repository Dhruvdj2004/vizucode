// Small SVG kit the theory topics draw their diagrams with.
//
// Everything is plain inline SVG painted with the theme's CSS variables, so a
// diagram flips correctly between light and dark mode with no extra work, and
// scales down cleanly on a phone via the viewBox.

import type { ReactNode } from 'react';

/** Diagram colour roles: accent / accent-2 / accent-3 / neutral. */
export type DC = 'a' | 'b' | 'c' | 'n';

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

export const dgStroke = (c: DC = 'n') => STROKE[c];
export const dgFill = (c: DC = 'n') => FILL[c];
export const dgInk = (c: DC = 'n') => INK[c];

/* ---------------- canvas ---------------- */

/** Arrowhead markers. Rendered once per page, referenced by every diagram. */
export function DgDefs() {
  return (
    <svg width="0" height="0" aria-hidden focusable="false" style={{ position: 'absolute' }}>
      <defs>
        {(['a', 'b', 'c', 'n'] as DC[]).map((c) => (
          <marker
            key={c}
            id={`dg-head-${c}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={STROKE[c]} />
          </marker>
        ))}
      </defs>
    </svg>
  );
}

/** SVG canvas. `w`/`h` define the coordinate space and the natural max width. */
export function Dg({
  w,
  h,
  children,
  cap,
}: {
  w: number;
  h: number;
  children: ReactNode;
  /** Accessible one-line description of what the drawing shows. */
  cap?: string;
}) {
  return (
    <svg
      className="dg"
      viewBox={`0 0 ${w} ${h}`}
      style={{ maxWidth: w }}
      role="img"
      aria-label={cap}
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
}

/* ---------------- shapes ---------------- */

interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  /** Smaller second line under the label. */
  sub?: string;
  c?: DC;
  dashed?: boolean;
  /** Corner radius. Pass 0 for a hard rectangle. */
  r?: number;
  fs?: number;
  /** Transparent fill — just the outline. */
  ghost?: boolean;
}

/** Rounded rectangle with a centred label (and optional sub-label). */
export function Box({ x, y, w, h, label, sub, c = 'n', dashed, r = 8, fs = 13, ghost }: BoxProps) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={r}
        fill={ghost ? 'transparent' : FILL[c]}
        stroke={STROKE[c]}
        strokeWidth="1.5"
        strokeDasharray={dashed ? '5 4' : undefined}
      />
      {label && (
        <text
          x={cx}
          y={sub ? cy - 7 : cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={fs}
          fontWeight="700"
          fill={INK[c]}
        >
          {label}
        </text>
      )}
      {sub && (
        <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle" fontSize={fs - 2} fill="var(--ink-soft)">
          {sub}
        </text>
      )}
    </g>
  );
}

/** Database cylinder — used wherever "the stored data" needs a symbol. */
export function Cyl({
  x,
  y,
  w,
  h,
  label,
  c = 'b',
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  c?: DC;
}) {
  const ry = Math.min(14, h / 5);
  return (
    <g>
      <path
        d={`M ${x} ${y + ry} v ${h - 2 * ry} a ${w / 2} ${ry} 0 0 0 ${w} 0 v ${-(h - 2 * ry)}`}
        fill={FILL[c]}
        stroke={STROKE[c]}
        strokeWidth="1.5"
      />
      <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} fill={FILL[c]} stroke={STROKE[c]} strokeWidth="1.5" />
      {label && (
        <text
          x={x + w / 2}
          y={y + ry + (h - ry) / 2 + 4}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill={INK[c]}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** Ellipse — ER attribute. `derived` draws it dashed, `key` underlines the text. */
export function Ell({
  cx,
  cy,
  rx,
  ry = 20,
  label,
  c = 'c',
  derived,
  keyAttr,
  multi,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry?: number;
  label: string;
  c?: DC;
  derived?: boolean;
  keyAttr?: boolean;
  multi?: boolean;
}) {
  return (
    <g>
      {multi && <ellipse cx={cx} cy={cy} rx={rx + 4} ry={ry + 4} fill="none" stroke={STROKE[c]} strokeWidth="1.5" />}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={FILL[c]}
        stroke={STROKE[c]}
        strokeWidth="1.5"
        strokeDasharray={derived ? '5 4' : undefined}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fontWeight="600"
        fill={INK[c]}
        textDecoration={keyAttr ? 'underline' : undefined}
      >
        {label}
      </text>
    </g>
  );
}

/** Diamond — ER relationship. */
export function Dia({
  cx,
  cy,
  rx,
  ry = 30,
  label,
  c = 'a',
  weak,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry?: number;
  label: string;
  c?: DC;
  weak?: boolean;
}) {
  const pts = `${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}`;
  return (
    <g>
      <polygon points={pts} fill={FILL[c]} stroke={STROKE[c]} strokeWidth="1.5" />
      {weak && (
        <polygon
          points={`${cx},${cy - ry + 6} ${cx + rx - 8},${cy} ${cx},${cy + ry - 6} ${cx - rx + 8},${cy}`}
          fill="none"
          stroke={STROKE[c]}
          strokeWidth="1.5"
        />
      )}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill={INK[c]}>
        {label}
      </text>
    </g>
  );
}

/* ---------------- connectors ---------------- */

interface ArrowProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c?: DC;
  label?: string;
  dashed?: boolean;
  /** Arrowheads on both ends. */
  both?: boolean;
  /** No arrowhead at all — a plain connector line. */
  plain?: boolean;
  /** Nudge the label off the midpoint. */
  dx?: number;
  dy?: number;
  /** Bend the line into an elbow: 'h' goes across first, 'v' goes down first. */
  bend?: 'h' | 'v';
}

/** Straight (or elbowed) connector with an optional midpoint label. */
export function Arrow({ x1, y1, x2, y2, c = 'n', label, dashed, both, plain, dx = 0, dy = -8, bend }: ArrowProps) {
  const d = bend === 'h' ? `M ${x1} ${y1} H ${x2} V ${y2}` : bend === 'v' ? `M ${x1} ${y1} V ${y2} H ${x2}` : `M ${x1} ${y1} L ${x2} ${y2}`;
  const mx = bend === 'h' ? x2 : bend === 'v' ? x1 : (x1 + x2) / 2;
  const my = bend === 'h' ? (y1 + y2) / 2 : bend === 'v' ? (y1 + y2) / 2 : (y1 + y2) / 2;
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={STROKE[c]}
        strokeWidth="1.5"
        strokeDasharray={dashed ? '5 4' : undefined}
        markerEnd={plain ? undefined : `url(#dg-head-${c})`}
        markerStart={both ? `url(#dg-head-${c})` : undefined}
      />
      {label && (
        <text x={mx + dx} y={my + dy} textAnchor="middle" fontSize="11.5" fontWeight="600" fill={INK[c]}>
          {label}
        </text>
      )}
    </g>
  );
}

/** Free-floating text. */
export function Txt({
  x,
  y,
  children,
  c = 'n',
  fs = 12,
  anchor = 'middle',
  bold,
  soft,
  mono,
}: {
  x: number;
  y: number;
  children: string;
  c?: DC;
  fs?: number;
  anchor?: 'start' | 'middle' | 'end';
  bold?: boolean;
  /** Use the muted ink colour instead of the role colour. */
  soft?: boolean;
  mono?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={fs}
      fontWeight={bold ? 700 : 400}
      fill={soft ? 'var(--ink-soft)' : INK[c]}
      fontFamily={mono ? 'var(--font-mono)' : undefined}
    >
      {children}
    </text>
  );
}

/** Dashed grouping frame with a small caption in the top-left. */
export function Frame({
  x,
  y,
  w,
  h,
  label,
  c = 'n',
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  c?: DC;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        fill="none"
        stroke={STROKE[c]}
        strokeWidth="1.2"
        strokeDasharray="6 5"
        opacity="0.8"
      />
      {label && (
        <text x={x + 10} y={y + 16} fontSize="11" fontWeight="700" fill={INK[c]} letterSpacing="0.05em">
          {label}
        </text>
      )}
    </g>
  );
}

/* ---------------- relation table ---------------- */

export interface RelProps {
  x: number;
  y: number;
  title?: string;
  cols: string[];
  rows: (string | number)[][];
  /** Column width — a single number, or per-column widths. */
  cw?: number | number[];
  rh?: number;
  c?: DC;
  /** Highlight individual cells, keyed "rowIndex,colIndex". */
  mark?: Record<string, DC>;
  /** Highlight whole rows by index. */
  rowMark?: Record<number, DC>;
  /** Underline these column headers (primary key convention). */
  pk?: number[];
  /** Draw these column headers in the accent-3 colour (foreign key convention). */
  fk?: number[];
}

/** A relation drawn as a grid: title bar, header row, then tuples. */
export function Rel({ x, y, title, cols, rows, cw = 74, rh = 24, c = 'n', mark, rowMark, pk, fk }: RelProps) {
  const widths = typeof cw === 'number' ? cols.map(() => cw) : cw;
  const total = widths.reduce((a, b) => a + b, 0);
  const left = (i: number) => x + widths.slice(0, i).reduce((a, b) => a + b, 0);
  const headY = title ? y + rh : y;

  return (
    <g>
      {title && (
        <>
          <rect x={x} y={y} width={total} height={rh} rx={6} fill={FILL[c]} stroke={STROKE[c]} strokeWidth="1.5" />
          <rect x={x} y={y + rh - 8} width={total} height={8} fill={FILL[c]} stroke="none" />
          <text x={x + total / 2} y={y + rh / 2 + 4} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={INK[c]}>
            {title}
          </text>
        </>
      )}

      {/* header row */}
      <rect x={x} y={headY} width={total} height={rh} fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1" />
      {cols.map((col, i) => (
        <g key={`h${i}`}>
          {i > 0 && (
            <line x1={left(i)} y1={headY} x2={left(i)} y2={headY + rh + rows.length * rh} stroke="var(--line)" strokeWidth="1" />
          )}
          <text
            x={left(i) + widths[i] / 2}
            y={headY + rh / 2 + 4}
            textAnchor="middle"
            fontSize="11.5"
            fontWeight="700"
            fill={fk?.includes(i) ? INK.c : INK.n}
            textDecoration={pk?.includes(i) ? 'underline' : undefined}
          >
            {col}
          </text>
        </g>
      ))}

      {/* tuples */}
      {rows.map((row, r) => (
        <g key={`r${r}`}>
          <rect
            x={x}
            y={headY + rh * (r + 1)}
            width={total}
            height={rh}
            fill={rowMark?.[r] ? FILL[rowMark[r]] : 'var(--surface)'}
            stroke="var(--line)"
            strokeWidth="1"
          />
          {row.map((cell, i) => {
            const m = mark?.[`${r},${i}`];
            return (
              <g key={`c${i}`}>
                {m && (
                  <rect
                    x={left(i) + 2}
                    y={headY + rh * (r + 1) + 2}
                    width={widths[i] - 4}
                    height={rh - 4}
                    rx={4}
                    fill={FILL[m]}
                    stroke={STROKE[m]}
                    strokeWidth="1.2"
                  />
                )}
                <text
                  x={left(i) + widths[i] / 2}
                  y={headY + rh * (r + 1) + rh / 2 + 4}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontFamily="var(--font-mono)"
                  fill={m ? INK[m] : rowMark?.[r] ? INK[rowMark[r]] : 'var(--ink)'}
                >
                  {String(cell)}
                </text>
              </g>
            );
          })}
        </g>
      ))}

      {/* outer border on top of the cell strokes */}
      <rect
        x={x}
        y={headY}
        width={total}
        height={rh * (rows.length + 1)}
        fill="none"
        stroke={STROKE[c]}
        strokeWidth="1.5"
      />
    </g>
  );
}

/** Total height a <Rel> will occupy — handy for stacking diagrams. */
export const relH = (rows: number, hasTitle: boolean, rh = 24) => rh * (rows + 1 + (hasTitle ? 1 : 0));
