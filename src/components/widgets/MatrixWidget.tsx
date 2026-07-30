import type { MatrixState } from '../../lib/types';

/** DP-table / 2D-grid template: cells with active/dependency/filled marks. */
export default function MatrixWidget({ state }: { state: MatrixState }) {
  const { grid, rowLabels, colLabels, mark = {}, aggs = [] } = state;
  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table className="mtx">
          <tbody>
            {colLabels && (
              <tr>
                {rowLabels && <td className="mtx-lbl" />}
                {colLabels.map((c, j) => (
                  <td key={j} className="mtx-lbl">{c}</td>
                ))}
              </tr>
            )}
            {grid.map((row, i) => (
              <tr key={i}>
                {rowLabels && <td className="mtx-lbl">{rowLabels[i]}</td>}
                {row.map((v, j) => (
                  <td key={j} className={`mtx-cell ${mark[`${i},${j}`] ?? ''}`}>
                    {v === '' ? ' ' : v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
