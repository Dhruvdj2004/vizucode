import type { BinarySearchState } from '../../lib/types';

/** Binary Search template: array-mode box row with lo/hi/mid carets and a
 *  dimmed eliminated region, or answer-mode number line with a shrinking
 *  candidate range, a mid probe marker and a confirmed-best marker. */
export default function BinarySearchWidget({ state }: { state: BinarySearchState }) {
  if (state.mode === 'array' && state.arr) {
    const { arr, lo, hi, mid, finalIndex } = state;
    return (
      <div>
        <div className="boxes">
          {arr.map((v, i) => {
            const eliminated = i < lo || i > hi;
            const isFinal = finalIndex !== undefined && finalIndex === i;
            const cls = isFinal ? 'final' : i === mid ? 'active' : eliminated ? 'dim' : '';
            return (
              <div className="boxcol" key={i}>
                <div className={`box ${cls}`}>{v}</div>
                <div className="box-index">{i}</div>
                <div className="ptr-caret a">
                  {[i === lo && lo <= hi ? 'lo' : '', i === hi && lo <= hi ? 'hi' : '', i === mid ? 'mid' : '']
                    .filter(Boolean)
                    .join('·') || ' '}
                </div>
              </div>
            );
          })}
        </div>
        {state.probe && <ProbeBox probe={state.probe} />}
      </div>
    );
  }

  // answer mode
  const [dMin, dMax] = state.domain ?? [state.lo, state.hi];
  const span = Math.max(1, dMax - dMin);
  const pct = (v: number) => `${((v - dMin) / span) * 100}%`;
  const rangeLeft = ((Math.max(state.lo, dMin) - dMin) / span) * 100;
  const rangeWidth = Math.max(0, ((Math.min(state.hi, dMax) - dMin) / span) * 100 - rangeLeft);

  return (
    <div>
      <div className="numline">
        <div className="track">
          <div className="range" style={{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }} />
          {state.mid !== undefined && (
            <div className="marker mid" style={{ left: pct(state.mid) }}>
              mid {state.mid}
            </div>
          )}
          {state.best !== undefined && state.best !== null && (
            <div className="marker best" style={{ left: pct(state.best), top: '1.1rem' }}>
              <span style={{ display: 'block', fontSize: '0.6rem' }}>▲</span>
              best {state.best}
            </div>
          )}
        </div>
        <div className="ends">
          <span>{dMin}</span>
          <span>{state.domainLabel ?? ''}</span>
          <span>{dMax}</span>
        </div>
        <div className="lohi" style={{ marginTop: '1.6rem' }}>
          <span>
            lo = <b>{state.lo}</b>
          </span>
          <span>
            hi = <b>{state.hi}</b>
          </span>
        </div>
      </div>
      {state.probe && <ProbeBox probe={state.probe} />}
    </div>
  );
}

function ProbeBox({ probe }: { probe: NonNullable<BinarySearchState['probe']> }) {
  return (
    <div className="probe-box">
      <span>{probe.text}</span>
      {probe.verdict && (
        <span className={`verdict ${probe.verdict}`}>{probe.verdictText ?? (probe.verdict === 'yes' ? 'feasible ✓' : 'infeasible ✗')}</span>
      )}
    </div>
  );
}
