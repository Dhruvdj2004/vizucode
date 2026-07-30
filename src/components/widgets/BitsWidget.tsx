import type { BitsState } from '../../lib/types';

/** Bit-manipulation template: labeled rows of bit boxes with per-bit highlights. */
export default function BitsWidget({ state }: { state: BitsState }) {
  const { rows, aggs = [] } = state;
  return (
    <div>
      {rows.map((row, ri) => (
        <div key={ri} className="bits-row">
          <span className={`bits-label ${row.c ?? ''}`}>{row.label}</span>
          <div className="bits">
            {row.bits.map((b, i) => (
              <span key={i} className={`bit ${row.hl?.includes(i) ? 'hl' : ''} ${b === 1 || b === '1' ? 'on' : ''}`}>
                {b}
              </span>
            ))}
          </div>
        </div>
      ))}
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
