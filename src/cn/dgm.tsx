// Networking-specific drawing helpers on top of the shared kit in
// src/content/dgm.tsx. The shared primitives are re-exported, so a topic file
// only ever imports from '../dgm'.

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

/** A network node — a small filled dot. `hub` draws it larger and accented. */
export function Dot({
  cx,
  cy,
  c = 'b',
  r = 6,
  label,
}: {
  cx: number;
  cy: number;
  c?: DC;
  r?: number;
  label?: string;
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={STROKE[c]} />
      {label && (
        <text x={cx} y={cy - r - 5} textAnchor="middle" fontSize="9.5" fill="var(--ink-soft)">
          {label}
        </text>
      )}
    </g>
  );
}

/** A plain cable between two nodes. */
export function Wire({
  x1,
  y1,
  x2,
  y2,
  c = 'n',
  w = 1.8,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c?: DC;
  w?: number;
}) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE[c]} strokeWidth={w} />;
}

/**
 * One of the standard topologies, drawn inside a square cell. Keeps all six
 * shapes consistent so they can sit side by side in a single figure.
 */
export function Topo({
  x,
  y,
  size = 120,
  kind,
  label,
}: {
  x: number;
  y: number;
  size?: number;
  kind: 'bus' | 'star' | 'ring' | 'mesh' | 'tree';
  label: string;
}) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.34;
  // Five points evenly around the circle, starting at the top.
  const ring = [0, 1, 2, 3, 4].map((i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });

  let body: React.ReactNode = null;
  if (kind === 'bus') {
    const by = cy;
    body = (
      <>
        <Wire x1={x + 10} y1={by} x2={x + size - 10} y2={by} />
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <g key={f}>
            <Wire x1={x + size * f} y1={by} x2={x + size * f} y2={by - 18} />
            <Dot cx={x + size * f} cy={by - 22} />
          </g>
        ))}
      </>
    );
  } else if (kind === 'star') {
    body = (
      <>
        {ring.map(([px, py], i) => (
          <Wire key={i} x1={cx} y1={cy} x2={px} y2={py} />
        ))}
        {ring.map(([px, py], i) => (
          <Dot key={i} cx={px} cy={py} />
        ))}
        <Dot cx={cx} cy={cy} c="a" r={8} />
      </>
    );
  } else if (kind === 'ring') {
    body = (
      <>
        {ring.map((_, i) => {
          const [ax, ay] = ring[i];
          const [bx, by] = ring[(i + 1) % 5];
          return <Wire key={i} x1={ax} y1={ay} x2={bx} y2={by} />;
        })}
        {ring.map(([px, py], i) => (
          <Dot key={i} cx={px} cy={py} />
        ))}
      </>
    );
  } else if (kind === 'mesh') {
    const pairs: [number, number][] = [];
    for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) pairs.push([i, j]);
    body = (
      <>
        {pairs.map(([i, j]) => (
          <Wire key={`${i}-${j}`} x1={ring[i][0]} y1={ring[i][1]} x2={ring[j][0]} y2={ring[j][1]} w={1.1} />
        ))}
        {ring.map(([px, py], i) => (
          <Dot key={i} cx={px} cy={py} />
        ))}
      </>
    );
  } else {
    // tree: one root, two hubs, four leaves
    const rootY = y + 22;
    const midY = cy + 4;
    const leafY = y + size - 20;
    body = (
      <>
        <Wire x1={cx} y1={rootY} x2={cx - 28} y2={midY} />
        <Wire x1={cx} y1={rootY} x2={cx + 28} y2={midY} />
        {[-28, 28].map((dx) => (
          <g key={dx}>
            <Wire x1={cx + dx} y1={midY} x2={cx + dx - 14} y2={leafY} />
            <Wire x1={cx + dx} y1={midY} x2={cx + dx + 14} y2={leafY} />
            <Dot cx={cx + dx - 14} cy={leafY} />
            <Dot cx={cx + dx + 14} cy={leafY} />
            <Dot cx={cx + dx} cy={midY} c="a" r={7} />
          </g>
        ))}
        <Dot cx={cx} cy={rootY} c="a" r={7} />
      </>
    );
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={size}
        height={size}
        rx={8}
        fill="var(--surface)"
        stroke="var(--line)"
        strokeWidth="1.2"
      />
      {body}
      <text x={cx} y={y + size + 15} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)">
        {label}
      </text>
    </g>
  );
}

export interface Layer {
  n: number | string;
  name: string;
  eg?: string;
  c?: DC;
}

/**
 * A protocol stack drawn top-down, one bar per layer. Used for both the OSI
 * seven layers and the four-layer TCP/IP model so they can be compared.
 */
export function Stack({
  x,
  y,
  w = 400,
  layers,
  rowH = 30,
  gap = 3,
  title,
}: {
  x: number;
  y: number;
  w?: number;
  layers: Layer[];
  rowH?: number;
  gap?: number;
  title?: string;
}) {
  return (
    <g>
      {title && (
        <text x={x} y={y - 9} fontSize="11.5" fontWeight="800" fill="var(--ink)">
          {title}
        </text>
      )}
      {layers.map((l, i) => {
        const ly = y + i * (rowH + gap);
        const c = l.c ?? 'b';
        return (
          <g key={`${l.n}-${l.name}`}>
            <rect x={x} y={ly} width={w} height={rowH} rx={4} fill={FILL[c]} />
            <rect x={x} y={ly} width={3} height={rowH} fill={STROKE[c]} />
            <text
              x={x + 14}
              y={ly + rowH / 2 + 4}
              fontSize="10.5"
              fontFamily="var(--font-mono)"
              fill="var(--ink-faint)"
            >
              {l.n}
            </text>
            <text x={x + 36} y={ly + rowH / 2 + 4} fontSize="11.5" fontWeight="700" fill={INK[c]}>
              {l.name}
            </text>
            {l.eg && (
              <text x={x + 148} y={ly + rowH / 2 + 4} fontSize="10.5" fill="var(--ink-soft)">
                {l.eg}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Total height a <Stack> occupies. */
export const stackH = (n: number, rowH = 30, gap = 3) => n * rowH + (n - 1) * gap;

/**
 * A message-sequence row between two parties. Used for the TCP handshake and
 * the request/response walkthroughs.
 */
export function Msg({
  x1,
  x2,
  y,
  label,
  c = 'b',
  /** Draw the arrowhead on the left instead of the right. */
  back,
}: {
  x1: number;
  x2: number;
  y: number;
  label: string;
  c?: DC;
  back?: boolean;
}) {
  const from = back ? x2 : x1;
  const to = back ? x1 : x2;
  return (
    <g>
      <path
        d={`M ${from} ${y} L ${to} ${y}`}
        stroke={STROKE[c]}
        strokeWidth="1.8"
        fill="none"
        markerEnd={`url(#dg-head-${c})`}
      />
      <text
        x={(x1 + x2) / 2}
        y={y - 8}
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fontFamily="var(--font-mono)"
        fill={INK[c]}
      >
        {label}
      </text>
    </g>
  );
}

/** A vertical lifeline with a heading, for sequence diagrams. */
export function Lifeline({
  x,
  y,
  h,
  label,
  c = 'n',
}: {
  x: number;
  y: number;
  h: number;
  label: string;
  c?: DC;
}) {
  return (
    <g>
      <rect x={x - 46} y={y} width={92} height={28} rx={5} fill={FILL[c]} stroke={STROKE[c]} strokeWidth="1.4" />
      <text x={x} y={y + 18} textAnchor="middle" fontSize="11.5" fontWeight="700" fill={INK[c]}>
        {label}
      </text>
      <line
        x1={x}
        y1={y + 28}
        x2={x}
        y2={y + h}
        stroke="var(--line)"
        strokeWidth="1.4"
        strokeDasharray="5 4"
      />
    </g>
  );
}
