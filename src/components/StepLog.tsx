import { useEffect, useRef } from 'react';
import type { Step } from '../lib/types';
import { TraceText } from './TraceLine';

/**
 * Numbered list of the steps shown so far: earlier steps stay above, faded,
 * and the current one is highlighted at the bottom. Clicking a step jumps to it.
 */
export default function StepLog({ steps, idx, onJump }: { steps: Step[]; idx: number; onJump: (i: number) => void }) {
  const boxRef = useRef<HTMLOListElement>(null);

  // Keep the current step in view by scrolling the list itself, not the page.
  useEffect(() => {
    const box = boxRef.current;
    const cur = box?.querySelector<HTMLElement>('.step-item.current');
    if (!box || !cur) return;
    box.scrollTo({ top: Math.max(0, cur.offsetTop - box.clientHeight + cur.offsetHeight + 6), behavior: 'smooth' });
  }, [idx, steps]);

  return (
    <ol className="step-log" ref={boxRef} aria-label="Steps">
      {steps.slice(0, idx + 1).map((s, i) => (
        <li
          key={i}
          className={`step-item${i === idx ? ' current' : ''}`}
          aria-current={i === idx ? 'step' : undefined}
          aria-live={i === idx ? 'polite' : undefined}
        >
          <button className="step-num mono" onClick={() => onJump(i)} title={`Go to step ${i + 1}`} disabled={i === idx}>
            Step {i + 1}
          </button>
          <span className="step-text">
            <TraceText tokens={s.trace} />
          </span>
        </li>
      ))}
    </ol>
  );
}
