import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { fetchProgress, updateProgress } from '../lib/api';
import { getSession, onAuthChange } from '../lib/auth';
import { canSeeCodeCatalyst } from '../lib/codeCatalyst';
import { codeCatalystSets, type CodeCatalystQuestion } from '../data/codeCatalyst';
import { problemRegistry } from '../problems';
import LeetCodeIcon from '../components/LeetCodeIcon';
import ProgressRing from '../components/ProgressRing';
import { Icon } from '../components/Icon';

const lcUrl = (q: CodeCatalystQuestion) => `https://leetcode.com/problems/${q.slug}/`;

/** #/code-catalyst — the Code Catalyst practice list, grouped by practice set. */
export default function CodeCatalystPage() {
  const [session, setSession] = useState(getSession);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<number, boolean>>({ [codeCatalystSets[0].set]: true });
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    fetchProgress(session.token)
      .then((p) => alive && setSolved(p.solved))
      .catch(() => alive && setSolved(new Set()));
    return () => {
      alive = false;
    };
  }, [session]);

  const all = useMemo(() => codeCatalystSets.flatMap((s) => s.questions), []);
  const stats = useMemo(() => {
    const diff = { Easy: { total: 0, solved: 0 }, Medium: { total: 0, solved: 0 }, Hard: { total: 0, solved: 0 } };
    let done = 0;
    for (const q of all) {
      diff[q.difficulty].total++;
      if (solved.has(q.slug)) {
        diff[q.difficulty].solved++;
        done++;
      }
    }
    return { total: all.length, solved: done, diff };
  }, [all, solved]);

  if (!canSeeCodeCatalyst(session?.user)) return <Navigate to="/" replace />;

  const toggle = (slug: string) => {
    if (!session) return;
    const next = !solved.has(slug);
    const flip = (on: boolean) =>
      setSolved((prev) => {
        const copy = new Set(prev);
        if (on) copy.add(slug);
        else copy.delete(slug);
        return copy;
      });
    flip(next);
    setSaveError(null);
    updateProgress(session.token, slug, next).catch((e: Error) => {
      flip(!next);
      setSaveError(e.message);
    });
  };

  const searching = query.trim() !== '' || difficulty !== 'All';
  const matches = (q: CodeCatalystQuestion) => {
    if (difficulty !== 'All' && q.difficulty !== difficulty) return false;
    const needle = query.trim().toLowerCase();
    return !needle || q.title.toLowerCase().includes(needle) || String(q.number) === needle;
  };

  return (
    <>
      <div className="viz-header">
        <div className="eyebrow">DSA Basics 2026</div>
        <h1 className="page-title">Code Catalyst</h1>
        <p className="serif" style={{ margin: '0.3rem 0 0', color: 'var(--ink-soft)' }}>
          The Code Catalyst practice sets — every question has a step-by-step visualizer.
        </p>
      </div>

      <div className="panel progress-card">
        <div className="progress-ring-wrap">
          <div className="eyebrow" style={{ textAlign: 'center', marginBottom: '0.4rem' }}>
            Code Catalyst progress
          </div>
          <ProgressRing solved={stats.solved} total={stats.total} />
        </div>
        <div className="progress-diffs">
          {(['Easy', 'Medium', 'Hard'] as const).map((d) => {
            const dot = d === 'Easy' ? 'var(--easy)' : d === 'Medium' ? 'var(--medium)' : 'var(--hard)';
            const { solved: s, total: t } = stats.diff[d];
            return (
              <div key={d} className="diff-line">
                <span className="diff-dot" style={{ background: dot }} />
                <span className="diff-name">{d}</span>
                <span className="diff-count mono">
                  {s}<span style={{ color: 'var(--ink-faint)' }}>/{t}</span>
                </span>
                <span className="diff-bar">
                  <span style={{ width: `${t ? (s / t) * 100 : 0}%`, background: dot }} />
                </span>
              </div>
            );
          })}
          <p className="serif diff-hint">Tick the circle next to a question to mark it solved.</p>
          {saveError && <p className="input-error">{saveError}</p>}
        </div>
      </div>

      <div className="panel search-bar">
        <input
          type="search"
          className="search-input"
          placeholder="Search by title or LeetCode #…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search Code Catalyst questions"
        />
        <div className="diff-filter" role="group" aria-label="Filter by difficulty">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
            <button
              key={d}
              className={`diff-chip ${d.toLowerCase()} ${difficulty === d ? 'active' : ''}`}
              onClick={() => setDifficulty(d)}
              aria-pressed={difficulty === d}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {searching && all.filter(matches).length === 0 && (
        <div className="panel serif" style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
          No questions match "{query || difficulty}".
        </div>
      )}

      {codeCatalystSets.map((set) => {
        const questions = searching ? set.questions.filter(matches) : set.questions;
        if (searching && questions.length === 0) return null;
        const setDone = set.questions.filter((q) => solved.has(q.slug)).length;
        const isOpen = searching || !!open[set.set];
        return (
          <section key={set.set} className="panel cat">
            <button className="cat-head" onClick={() => setOpen((o) => ({ ...o, [set.set]: !o[set.set] }))} aria-expanded={isOpen}>
              <span className={`chev ${isOpen ? 'open' : ''}`}><Icon name="chevron" size={14} /></span>
              Set {set.set} · {set.name}
              <span className="count">
                {searching
                  ? `${questions.length} match${questions.length === 1 ? '' : 'es'}`
                  : `${setDone} / ${set.questions.length} solved`}
              </span>
              <span className="cat-progress" aria-hidden>
                <div style={{ width: `${searching ? 0 : (setDone / set.questions.length) * 100}%` }} />
              </span>
            </button>
            {isOpen &&
              questions.map((q) => {
                const isSolved = solved.has(q.slug);
                return (
                  <div key={q.slug} className={`qrow ${isSolved ? 'solved' : ''}`}>
                    <button
                      className={`qcheck ${isSolved ? 'on' : ''}`}
                      onClick={() => toggle(q.slug)}
                      aria-label={`Mark ${q.title} as ${isSolved ? 'unsolved' : 'solved'}`}
                      title={isSolved ? 'Mark unsolved' : 'Mark solved'}
                    >
                      <Icon name="check" size={13} />
                    </button>
                    <span className="qid mono">#{q.number}</span>
                    <span className="qtitle">{q.title}</span>
                    <span className={`badge ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                    <span className="spacer" />
                    <a className="lc-link" href={lcUrl(q)} target="_blank" rel="noreferrer" aria-label={`Open ${q.title} on LeetCode`} title="Open on LeetCode">
                      <LeetCodeIcon />
                    </a>
                    {problemRegistry[q.slug] ? (
                      <Link to={`/visualize/${q.slug}`} state={{ from: 'code-catalyst' }}>
                        <button className="btn primary">Visualize</button>
                      </Link>
                    ) : (
                      <span className="soon">coming soon</span>
                    )}
                  </div>
                );
              })}
          </section>
        );
      })}
    </>
  );
}
