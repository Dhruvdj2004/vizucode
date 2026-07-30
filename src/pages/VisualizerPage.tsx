import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { problemRegistry } from '../problems';
import { fetchProblem } from '../lib/api';
import type { StaticProblem } from '../lib/serialize';
import { isRunError, type RunResult } from '../lib/types';
import { getSession, onAuthChange } from '../lib/auth';
import { isCategoryLocked } from '../lib/plan';
import CodePanel from '../components/CodePanel';
import TraceLine from '../components/TraceLine';
import LeetCodeIcon from '../components/LeetCodeIcon';
import BinarySearchWidget from '../components/widgets/BinarySearchWidget';
import ArrayWidget from '../components/widgets/ArrayWidget';
import TreeWidget from '../components/widgets/TreeWidget';
import MatrixWidget from '../components/widgets/MatrixWidget';
import StackWidget from '../components/widgets/StackWidget';
import ListWidget from '../components/widgets/ListWidget';
import HeapWidget from '../components/widgets/HeapWidget';
import BitsWidget from '../components/widgets/BitsWidget';
import IntervalsWidget from '../components/widgets/IntervalsWidget';

const SPEEDS = [
  { label: '0.5×', ms: 950 },
  { label: '1×', ms: 475 },
  { label: '2×', ms: 240 },
];

export default function VisualizerPage() {
  const { slug } = useParams();
  // Static content (metadata, code, inputs, note) comes from the API with a
  // local fallback; the trace generator always runs locally for instant steps.
  const [problem, setProblem] = useState<StaticProblem | null | undefined>(undefined);
  const runner = slug ? problemRegistry[slug]?.run : undefined;
  const [session, setSession] = useState(getSession);
  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<RunResult | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0); // default 0.5×
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    setProblem(undefined);
    if (!slug) {
      setProblem(null);
      return;
    }
    fetchProblem(slug).then(({ def }) => {
      if (alive) setProblem(def);
    });
    return () => {
      alive = false;
    };
  }, [slug]);

  const doRun = useCallback(
    (vals: Record<string, string>) => {
      if (!runner) return;
      const r = runner(vals);
      if (isRunError(r)) {
        setError(r.error);
      } else {
        setError(null);
        setRun(r);
        setIdx(0);
        setPlaying(false);
      }
    },
    [runner]
  );

  // Initialize inputs + first run when the problem loads.
  useEffect(() => {
    if (!problem || !runner) return;
    const defaults = Object.fromEntries(problem.inputs.map((f) => [f.key, f.defaultValue]));
    setValues(defaults);
    doRun(defaults);
  }, [problem, runner, doRun]);

  const last = run ? run.steps.length - 1 : 0;
  const finished = run !== null && idx === last;

  // Auto-play.
  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (playing && run) {
      timer.current = window.setInterval(() => {
        setIdx((i) => {
          if (i >= run.steps.length - 1) {
            setPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, SPEEDS[speed].ms);
    }
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, speed, run]);

  if (problem === undefined) {
    return <div className="panel serif">Loading visualizer…</div>;
  }
  if (!problem || !runner) {
    return (
      <div className="panel">
        <h2>Visualizer not built yet</h2>
        <p className="serif">This question doesn't have a step-trace yet. It's on the roadmap.</p>
        <Link to="/">
          <button className="btn primary">← Back to questions</button>
        </Link>
      </div>
    );
  }

  if (isCategoryLocked(problem.category, session?.user)) {
    return (
      <div className="panel">
        <h2>🔒 This one's locked</h2>
        <p className="serif">Upgrade to unlock every pattern, including {problem.category}.</p>
        <Link to="/upgrade">
          <button className="btn primary">Upgrade</button>
        </Link>
      </div>
    );
  }

  const step = run?.steps[idx];

  const widget = step
    ? {
        'binary-search': <BinarySearchWidget state={step.state as never} />,
        array: <ArrayWidget state={step.state as never} />,
        tree: <TreeWidget state={step.state as never} />,
        graph: <TreeWidget state={step.state as never} />,
        matrix: <MatrixWidget state={step.state as never} />,
        stack: <StackWidget state={step.state as never} />,
        list: <ListWidget state={step.state as never} />,
        heap: <HeapWidget state={step.state as never} />,
        bits: <BitsWidget state={step.state as never} />,
        intervals: <IntervalsWidget state={step.state as never} />,
      }[problem.widget]
    : null;

  return (
    <>
      <div className="viz-header">
        <div className="eyebrow">{problem.category}</div>
        <h1 className="page-title">
          {problem.title}{' '}
          <a
            href={problem.leetcode}
            target="_blank"
            rel="noreferrer"
            className="lc-link"
            title="Open on LeetCode"
            aria-label={`Open ${problem.title} on LeetCode`}
          >
            <LeetCodeIcon size={18} />
          </a>
        </h1>
        <p className="serif desc">{problem.technique}</p>
      </div>

      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div className="input-panel">
          {problem.inputs.map((f) => (
            <div className="field" key={f.key}>
              <label htmlFor={`in-${f.key}`}>{f.label}</label>
              <input
                id={`in-${f.key}`}
                className={f.wide ? 'lg' : ''}
                value={values[f.key] ?? ''}
                placeholder={f.placeholder}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && doRun(values)}
              />
            </div>
          ))}
          <button className="btn primary" onClick={() => doRun(values)}>
            Run
          </button>
          {error && <div className="input-error">{error}</div>}
        </div>

        <div className="transport">
          <button className="btn icon" onClick={() => { setIdx(0); setPlaying(false); }} aria-label="Reset" title="Reset">
            ⏮
          </button>
          <button className="btn icon" onClick={() => { setIdx((i) => Math.max(0, i - 1)); setPlaying(false); }} aria-label="Step back" title="Step back">
            ←
          </button>
          <button
            className="btn icon primary"
            onClick={() => {
              if (finished) { setIdx(0); setPlaying(true); }
              else setPlaying((p) => !p);
            }}
            aria-label={playing ? 'Pause' : 'Play'}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <button className="btn icon" onClick={() => { setIdx((i) => Math.min(last, i + 1)); setPlaying(false); }} aria-label="Step forward" title="Step forward">
            →
          </button>
          <input
            className="scrub"
            type="range"
            min={0}
            max={last}
            value={idx}
            onChange={(e) => { setIdx(Number(e.target.value)); setPlaying(false); }}
            aria-label="Scrub through steps"
          />
          <span className="counter mono">
            step {idx + 1} / {run ? run.steps.length : 1}
          </span>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Playback speed">
            {SPEEDS.map((s, i) => (
              <option key={s.label} value={i}>{s.label}</option>
            ))}
          </select>
        </div>

        {step && <TraceLine tokens={step.trace} />}
      </div>

      <div className="viz-grid">
        <div className="viz-left">
          <div className="panel">
            <div className="eyebrow faint widget-title">{problem.widgetTitle}</div>
            {widget}
          </div>
        </div>
        <CodePanel code={problem.code} activeTag={step?.tag} activeTag2={step?.tag2} />
      </div>

      {finished && run && (
        <div className="panel result-panel">
          <div className="eyebrow rlabel">Result</div>
          <div className="rvalue">{run.result}</div>
          {run.resultDetail && <div className="rdetail serif">{run.resultDetail}</div>}
        </div>
      )}

      <div className="panel note-panel">
        <strong>Why this works.</strong> {problem.note}
      </div>

      <div className="complexity">
        <span>
          Time <b>{problem.complexity.time}</b>
        </span>
        <span>
          Space <b>{problem.complexity.space}</b>
        </span>
        <span style={{ marginLeft: 'auto' }}>
          <Link to="/">← All questions</Link>
        </span>
      </div>
    </>
  );
}
