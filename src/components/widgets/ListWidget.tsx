import type { ListState } from '../../lib/types';

/** Linked-list template: chains of boxes joined by arrows, pointer labels underneath. */
export default function ListWidget({ state }: { state: ListState }) {
  const { chains, ptrs = [], aggs = [] } = state;
  return (
    <div>
      {chains.map((chain, ci) => (
        <div key={ci} className="chain-row">
          {chain.label && <span className="chain-label">{chain.label}</span>}
          <div className="chain">
            {chain.items.map((it, i) => {
              const carets = ptrs.filter((p) => p.chain === ci && p.i === i);
              return (
                <div key={i} className="chain-cell">
                  <div className="chain-node">
                    <div className={`box ${it.mark ?? ''}`}>{it.v}</div>
                    <div className="ptr-caret">
                      {carets.length === 0
                        ? ' '
                        : carets.map((p, j) => (
                            <span key={j} className={`ptr-caret ${p.c}`}>
                              {j > 0 && ' '}▲{p.name}
                            </span>
                          ))}
                    </div>
                  </div>
                  {i < chain.items.length - 1 && <span className="chain-arrow">→</span>}
                </div>
              );
            })}
            {!chain.broken && <span className="chain-arrow faint">→ ∅</span>}
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
