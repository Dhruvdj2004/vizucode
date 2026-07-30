import type { ArrayState } from '../../lib/types';

/** Two Pointers / Sliding Window template: a row of value boxes (or height
 *  bars), pointer carets underneath, an optional highlighted window range,
 *  and running aggregate chips. */
export default function ArrayWidget({ state }: { state: ArrayState }) {
  const { arr, ptrs = [], window: win, mark = {}, aggs = [], bars } = state;

  const caretsAt = (i: number) =>
    ptrs.filter((p) => p.i === i);

  const boxClass = (i: number) => {
    if (mark[i]) return mark[i]!;
    if (win && i >= win[0] && i <= win[1]) return 'win';
    return '';
  };

  if (bars) {
    const nums = arr.map((v) => Number(v));
    const max = Math.max(1, ...nums);
    return (
      <div>
        <div className="bars">
          {nums.map((v, i) => {
            const cls = boxClass(i);
            return (
              <div className="barcol" key={i}>
                <div
                  className={`bar ${cls === 'active' ? 'active' : cls === 'win' || cls === 'good' ? 'win' : ''}`}
                  style={{ height: `${Math.max(4, (v / max) * 100)}%` }}
                  title={String(v)}
                />
                <div className="box-index">{v}</div>
                {carets(caretsAt(i))}
              </div>
            );
          })}
        </div>
        {aggs.length > 0 && <Aggs aggs={aggs} />}
      </div>
    );
  }

  return (
    <div>
      <div className="boxes">
        {arr.map((v, i) => (
          <div className="boxcol" key={i}>
            <div className={`box ${boxClass(i)}`}>{v === '' ? ' ' : v}</div>
            <div className="box-index">{i}</div>
            {carets(caretsAt(i))}
          </div>
        ))}
      </div>
      {aggs.length > 0 && <Aggs aggs={aggs} />}
    </div>
  );
}

function carets(list: { name: string; c: string }[]) {
  return (
    <div className="ptr-caret">
      {list.length === 0
        ? ' '
        : list.map((p, j) => (
            <span key={j} className={`ptr-caret ${p.c}`}>
              {j > 0 && ' '}▲{p.name}
            </span>
          ))}
    </div>
  );
}

function Aggs({ aggs }: { aggs: NonNullable<ArrayState['aggs']> }) {
  return (
    <div className="aggs">
      {aggs.map((a, i) => (
        <span key={i} className={`agg ${a.c ?? ''}`}>
          {a.label} <b>{a.value}</b>
        </span>
      ))}
    </div>
  );
}
