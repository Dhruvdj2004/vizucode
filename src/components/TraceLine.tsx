import type { TraceToken } from '../lib/types';

/** Flattens nested token groups (a step's text may contain conditional sub-arrays). */
export function flatTokens(tokens: TraceToken[]): Exclude<TraceToken, TraceToken[]>[] {
  return tokens.flatMap((t) => (Array.isArray(t) ? flatTokens(t) : [t]));
}

/** One step's plain-English explanation with coloured chips. */
export function TraceText({ tokens }: { tokens: TraceToken[] }) {
  return (
    <>
      {flatTokens(tokens).map((tok, i) =>
        typeof tok === 'string' ? (
          <span key={i}>{tok}</span>
        ) : (
          <span key={i} className={`tag-chip ${tok.c}`}>{tok.t}</span>
        )
      )}
    </>
  );
}

export default function TraceLine({ tokens }: { tokens: TraceToken[] }) {
  return (
    <div className="trace-line" role="status" aria-live="polite">
      <TraceText tokens={tokens} />
    </div>
  );
}
