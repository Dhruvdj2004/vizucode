import type { StackItem, StackState } from '../../lib/types';
import ArrayWidget from './ArrayWidget';

function Column({ items, label }: { items: StackItem[]; label?: string }) {
  return (
    <div className="stack-col">
      <h4>{label ?? 'Stack'}</h4>
      <div className="stack-box">
        {items.length === 0 ? (
          <div className="empty">empty</div>
        ) : (
          [...items].reverse().map((it, i) => (
            <div key={i} className={`stack-item ${it.c ?? ''} ${i === 0 ? 'top' : ''}`}>
              {it.v}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/** Stack / Queue / Monotonic-stack template: input row + vertical stack(s). */
export default function StackWidget({ state }: { state: StackState }) {
  const { array, stack, stackLabel, stack2, stack2Label, aggs = [] } = state;
  return (
    <div>
      <div className="stack-wrap">
        {array && (
          <div style={{ flex: '1 1 260px', minWidth: 0 }}>
            <ArrayWidget state={array} />
          </div>
        )}
        <Column items={stack} label={stackLabel} />
        {stack2 && <Column items={stack2} label={stack2Label} />}
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
