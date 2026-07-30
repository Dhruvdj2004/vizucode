import type { HeapState } from '../../lib/types';

const W = 460;
const H = 190;
const PAD = 30;

/** Heap template: the same heap as an array row AND an implicit binary tree. */
export default function HeapWidget({ state }: { state: HeapState }) {
  const { heap, hl = [], ok = [], label, aggs = [] } = state;
  const n = heap.length;
  const depth = n === 0 ? 0 : Math.floor(Math.log2(n));
  const pos = (i: number) => {
    const level = Math.floor(Math.log2(i + 1));
    const idxInLevel = i + 1 - 2 ** level;
    const slots = 2 ** level;
    return {
      x: PAD + ((idxInLevel + 0.5) / slots) * (W - 2 * PAD),
      y: PAD + (depth === 0 ? 0.5 : level / depth) * (H - 2 * PAD),
    };
  };
  const cls = (i: number) => (hl.includes(i) ? 'current' : ok.includes(i) ? 'done' : '');

  return (
    <div>
      {label && <div className="eyebrow faint" style={{ marginBottom: '0.5rem' }}>{label}</div>}
      <div className="boxes">
        {heap.map((v, i) => (
          <div className="boxcol" key={i}>
            <div className={`box ${hl.includes(i) ? 'active' : ok.includes(i) ? 'good' : ''}`}>{v}</div>
            <div className="box-index">{i}</div>
          </div>
        ))}
        {heap.length === 0 && <div className="empty soon">empty heap</div>}
      </div>
      {n > 0 && (
        <svg className="tree-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Heap as binary tree" style={{ marginTop: '0.75rem', width: '100%' }}>
          {heap.map((_, i) => {
            if (i === 0) return null;
            const p = pos(Math.floor((i - 1) / 2));
            const c = pos(i);
            return <line key={i} className="edge" x1={p.x} y1={p.y} x2={c.x} y2={c.y} />;
          })}
          {heap.map((v, i) => {
            const p = pos(i);
            return (
              <g key={i} className={`node ${cls(i)}`} transform={`translate(${p.x}, ${p.y})`}>
                <circle r={15} />
                <text textAnchor="middle" dy="4">{v}</text>
              </g>
            );
          })}
        </svg>
      )}
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
