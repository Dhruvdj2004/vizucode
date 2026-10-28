import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { problemRegistry } from '../problems';
import { fetchProblem } from '../lib/api';
import { toStatic, type StaticProblem } from '../lib/serialize';
import { isRunError, type ProblemDef, type RunResult } from '../lib/types';
import { getSession, onAuthChange } from '../lib/auth';
import { isCategoryLocked } from '../lib/plan';
import { canSeeCodeCatalyst } from '../lib/codeCatalyst';
import { codeCatalystSlugs } from '../data/codeCatalyst';
import { catalog } from '../data/catalog';
import CodePanel from '../components/CodePanel';
import StepLog from '../components/StepLog';
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
import { Icon } from '../components/Icon';

const mainSlugs = new Set(catalog.map((q) => q.slug));

const SPEEDS = [
  { label: '0.5×', ms: 950 },
  { label: '1×', ms: 475 },
  { label: '2×', ms: 240 },
];

/**
 * `previewDef` renders an unpublished visualizer (the admin panel's live
 * preview of generated code) instead of looking the slug up.
 */
export default function VisualizerPage({ previewDef }: { previewDef?: ProblemDef } = {}) {
  const { slug: routeSlug } = useParams();
  const slug = previewDef ? previewDef.slug : routeSlug;
  // Static content (metadata, code, inputs, note) comes from the API with a
  // local fallback; the trace generator always runs locally for instant steps.
  const [problem, setProblem] = useState<StaticProblem | null | undefined>(undefined);
  const def = previewDef ?? (slug ? problemRegistry[slug] : undefined);
  // Which solution is on screen. The brute force shares this problem's widget
  // and inputs, so switching only swaps the code, the trace generator and the
  // surrounding prose — the same run values stay in the boxes.
  const [approach, setApproach] = useState<'optimal' | 'brute'>('optimal');
  const hasBrute = !!problem?.brute && !!def?.brute;
  const showBrute = hasBrute && approach === 'brute';
  const runner = showBrute ? def?.brute?.run : def?.run;
  // What the prose panels describe: the selected approach's own text.
  const view = showBrute && problem?.brute ? problem.brute : problem;
  const [session, setSession] = useState(getSession);
  useEffect(() => onAuthChange(() => setSession(getSession())), []);
  // Code Catalyst: its questions skip the Pro lock for people who can see that
  // section, and the ones that are not in the main list stay hidden from
  // everyone else.
  const location = useLocation();
  const catalystUser = canSeeCodeCatalyst(session?.user);
  const inCatalyst = !!slug && codeCatalystSlugs.has(slug);
  const catalystOnly = inCatalyst && !mainSlugs.has(slug!);
  const cameFromCatalyst = (location.state as { from?: string } | null)?.from === 'code-catalyst';
  const backTo = catalystUser && (catalystOnly || cameFromCatalyst) ? '/code-catalyst' : '/dsa';

  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState<RunResult | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0); // default 0.5×
  const timer = useRef<number | null>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  useEffect(() => {
    let alive = true;
    setProblem(undefined);
    // Drop the previous question's steps so its widget state never reaches
    // the next question's widget.
    setRun(null);
    setIdx(0);
    if (previewDef) {
      setProblem(toStatic(previewDef));
      return;
    }
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
  }, [slug, previewDef]);

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

  // Reset the inputs and drop back to the optimal solution when a different
  // question loads.
  useEffect(() => {
    if (!problem) return;
    const defaults = Object.fromEntries(problem.inputs.map((f) => [f.key, f.defaultValue]));
    valuesRef.current = defaults;
    setValues(defaults);
    setApproach('optimal');
  }, [problem]);

  // (Re)run on load and whenever the approach switches, so flipping to the
  // brute force replays whatever is currently in the boxes instead of
  // clearing it. Values come through a ref on purpose: typing should not
  // re-run on every keystroke — that is what Run and Enter are for.
  useEffect(() => {
    // On a direct visualizer-to-visualizer navigation the new runner arrives a
    // render before the new problem (and its default inputs), so wait for both.
    if (problem && runner && problem.slug === slug) doRun(valuesRef.current);
  }, [problem, runner, doRun]);

  // Wide screens: size the controls + visualization + code workspace to the
  // window, so all three are on screen together (each part scrolls inside
  // itself if it has to). Narrow screens keep the stacked page.
  const workRef = useRef<HTMLDivElement>(null);
  const [workH, setWorkH] = useState<number | null>(null);
  useLayoutEffect(() => {
    const fit = () => {
      const el = workRef.current;
      if (!el || window.innerWidth < 1000) {
        setWorkH(null);
        return;
      }
      const top = el.getBoundingClientRect().top + window.scrollY;
      setWorkH(Math.max(480, Math.round(window.innerHeight - top - 16)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [problem, hasBrute]);

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
  if (!previewDef && catalystOnly && !catalystUser) {
    return (
      <div className="panel">
        <h2>Question not found</h2>
        <p className="serif">This question isn't available on your account.</p>
        <Link to="/dsa">
          <button className="btn primary">← Back to questions</button>
        </Link>
      </div>
    );
  }
  if (!problem || !runner) {
    return (
      <div className="panel">
        <h2>Visualizer not built yet</h2>
        <p className="serif">This question doesn't have a step-trace yet. It's on the roadmap.</p>
        <Link to={backTo}>
          <button className="btn primary">← Back to questions</button>
        </Link>
      </div>
    );
  }

  if (!previewDef && isCategoryLocked(problem.category, session?.user) && !(inCatalyst && catalystUser)) {
    return (
      <div className="panel">
        <h2><Icon name="lock" /> This one's locked</h2>
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
    <div className="viz-page">
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
        <p className="serif desc">{view?.technique}</p>
      </div>

      {hasBrute && (
        <div className="approach-tabs" role="tablist" aria-label="Solution approach">
          <button
            role="tab"
            aria-selected={!showBrute}
            className={`approach-tab${!showBrute ? ' on' : ''}`}
            onClick={() => setApproach('optimal')}
          >
            Optimal
            <span className="approach-cx mono">{problem.complexity.time}</span>
          </button>
          <button
            role="tab"
            aria-selected={showBrute}
            className={`approach-tab${showBrute ? ' on' : ''}`}
            onClick={() => setApproach('brute')}
          >
            {problem.brute!.label}
            <span className="approach-cx mono">{problem.brute!.complexity.time}</span>
          </button>
        </div>
      )}

      <div className="viz-work" ref={workRef} style={workH ? { height: workH } : undefined}>
      <div className="viz-left">
      <div className="panel viz-controls">
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
            <Icon name="skip-back" />
          </button>
          <button className="btn icon" onClick={() => { setIdx((i) => Math.max(0, i - 1)); setPlaying(false); }} aria-label="Step back" title="Step back">
            <Icon name="arrow-left" />
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
            <Icon name={playing ? 'pause' : 'play'} />
          </button>
          <button className="btn icon" onClick={() => { setIdx((i) => Math.min(last, i + 1)); setPlaying(false); }} aria-label="Step forward" title="Step forward">
            <Icon name="arrow-right" />
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

        {run && <StepLog steps={run.steps} idx={idx} onJump={(i) => { setIdx(i); setPlaying(false); }} />}
      </div>
        <div className="panel viz-stage">
          <div className="eyebrow faint widget-title">{problem.widgetTitle}</div>
          {widget}
        </div>
      </div>
        <CodePanel code={view!.code} activeTag={step?.tag} activeTag2={step?.tag2} />
      </div>

      {finished && run && (
        <div className="panel result-panel">
          <div className="eyebrow rlabel">Result</div>
          <div className="rvalue">{run.result}</div>
          {run.resultDetail && <div className="rdetail serif">{run.resultDetail}</div>}
        </div>
      )}

      <div className="panel note-panel">
        <strong>Why this works.</strong> {view!.note}
      </div>

      <div className="complexity">
        <span>
          Time <b>{view!.complexity.time}</b>
        </span>
        <span>
          Space <b>{view!.complexity.space}</b>
        </span>
        {hasBrute && (
          <span className="cx-vs">
            {showBrute ? (
              <>
                Optimal does it in <b>{problem.complexity.time}</b>
              </>
            ) : (
              <>
                {problem.brute!.label} takes <b>{problem.brute!.complexity.time}</b>
              </>
            )}
          </span>
        )}
        <span style={{ marginLeft: 'auto' }}>
          <Link to={backTo}>← All questions</Link>
        </span>
      </div>
    </div>
  );
}
