import type { TraceToken } from '../lib/types';

export default function TraceLine({ tokens }: { tokens: TraceToken[] }) {
  return (
    <div className="trace-line" role="status" aria-live="polite">
      {tokens.map((tok, i) =>
        typeof tok === 'string' ? (
          <span key={i}>{tok}</span>
        ) : (
          <span key={i} className={`tag-chip ${tok.c}`}>{tok.t}</span>
        )
      )}
    </div>
  );
}
