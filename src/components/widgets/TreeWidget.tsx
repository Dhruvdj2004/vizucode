import type { TreeState } from '../../lib/types';

const W = 520;
const H = 260;
const PAD = 34;

/** Trees template: node-link SVG diagram with current/visited/queued states,
 *  optional per-node badges, and a call-stack or queue side panel. */
export default function TreeWidget({ state }: { state: TreeState }) {
  const { nodes, edges, current, done = [], queued = [], stack, stackTitle, aggs = [], directed, edgeMark = [], edgeDim = [] } = state;
  const pos = new Map(nodes.map((n) => [n.id, n]));
  const px = (x: number) => PAD + x * (W - 2 * PAD);
  const py = (y: number) => PAD + y * (H - 2 * PAD);

  return (
    <div>
      <div className="tree-wrap">
        <svg className="tree-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Node-link diagram">
          {directed && (
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ink-faint)" />
              </marker>
            </defs>
          )}
          {edges.map(([a, b], i) => {
            const na = pos.get(a);
            const nb = pos.get(b);
            if (!na || !nb) return null;
            const key = `${a}-${b}`;
            const marked = edgeMark.includes(key);
            const dimmed = edgeDim.includes(key);
            return (
              <line
                key={i}
                className={`edge ${marked ? 'mark' : ''} ${dimmed ? 'dimmed' : ''}`}
                x1={px(na.x)}
                y1={py(na.y)}
                x2={px(nb.x)}
                y2={py(nb.y)}
                markerEnd={directed ? 'url(#arrow)' : undefined}
              />
            );
          })}
          {nodes.map((n) => {
            const cls =
              n.id === current ? 'current' : done.includes(n.id) ? 'done' : queued.includes(n.id) ? 'queued' : '';
            return (
              <g key={n.id} className={`node ${cls}`} transform={`translate(${px(n.x)}, ${py(n.y)})`}>
                <circle r={16} />
                <text textAnchor="middle" dy="4">
                  {n.val}
                </text>
                {n.badge && (
                  <text className="nbadge" textAnchor="middle" dy="-22">
                    {n.badge}
                  </text>
                )}
                {done.includes(n.id) && (
                  <text textAnchor="middle" dy="28" fontSize="9" fill="var(--accent-2)">
                    ✓
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {stack && (
          <div className="side-stack">
            <h4>{stackTitle ?? 'Call stack'}</h4>
            {stack.length === 0 ? (
              <div className="empty">empty</div>
            ) : (
              [...stack].reverse().map((f, i) => (
                <div key={i} className={`frame ${i === 0 ? 'top' : ''}`}>
                  {f.text}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {aggs.length > 0 && (
        <div className="aggs">
          {aggs.map((a, i) => (
            <span key={i} className={`agg ${a.c ?? ''}`}>
              {a.label} <b>{a.value}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
