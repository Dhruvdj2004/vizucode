import type { IntervalsState } from '../../lib/types';

/** Intervals template: [start,end] bars laid out on a shared timeline. */
export default function IntervalsWidget({ state }: { state: IntervalsState }) {
  const { intervals, domain, aggs = [] } = state;
  const [d0, d1] = domain;
  const span = Math.max(1, d1 - d0);
  const pct = (v: number) => ((v - d0) / span) * 100;

  return (
    <div>
      <div className="ivl-wrap">
        {intervals.map((iv, i) => (
          <div key={i} className="ivl-row">
            <div
              className={`ivl-bar ${iv.mark ?? ''}`}
              style={{ left: `${pct(iv.s)}%`, width: `${Math.max(1.5, pct(iv.e) - pct(iv.s))}%` }}
            >
              <span>{iv.label ?? `[${iv.s},${iv.e}]`}</span>
            </div>
          </div>
        ))}
        <div className="ends" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', marginTop: '0.3rem' }}>
          <span>{d0}</span>
          <span>{d1}</span>
        </div>
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
