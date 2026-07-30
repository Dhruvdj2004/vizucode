import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchQuestions, fetchProgress, updateProgress, type DataSource, type QuestionRow, type Streak } from '../lib/api';
import { getSession, onAuthChange } from '../lib/auth';
import { isCategoryLocked } from '../lib/plan';
import LeetCodeIcon from '../components/LeetCodeIcon';
import ProgressRing from '../components/ProgressRing';

export default function HomePage() {
  const [rows, setRows] = useState<QuestionRow[] | null>(null);
  const [source, setSource] = useState<DataSource>('local');
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [session, setSession] = useState(getSession);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0 });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const navigate = useNavigate();

  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  useEffect(() => {
    let alive = true;
    fetchQuestions().then(({ rows, source }) => {
      if (!alive) return;
      setRows(rows);
      setSource(source);
      setOpen({ [rows[0]?.category]: true });
    });
    return () => {
      alive = false;
    };
  }, []);

  // Load this user's progress on sign-in; clear it on sign-out.
  useEffect(() => {
    if (!session) {
      setSolved(new Set());
      setStreak({ current: 0, longest: 0 });
      return;
    }
    let alive = true;
    fetchProgress(session.token)
      .then(({ solved, streak }) => {
        if (!alive) return;
        setSolved(solved);
        setStreak(streak);
      })
      .catch(() => {
        if (!alive) return;
        setSolved(new Set());
        setStreak({ current: 0, longest: 0 });
      });
    return () => {
      alive = false;
    };
  }, [session]);

  const toggle = (slug: string) => {
    if (!session) {
      navigate('/login');
      return;
    }
    const next = !solved.has(slug);
    // Optimistic: flip immediately, roll back if the API rejects it.
    setSolved((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(slug);
      else copy.delete(slug);
      return copy;
    });
    setSaveError(null);
    updateProgress(session.token, slug, next)
      .then(() => {
        // Streak depends on solve dates the client doesn't have locally — re-sync from the server.
        fetchProgress(session.token).then(({ streak }) => setStreak(streak));
      })
      .catch((e: Error) => {
        setSolved((prev) => {
          const copy = new Set(prev);
          if (next) copy.delete(slug);
          else copy.add(slug);
          return copy;
        });
        setSaveError(e.message);
      });
  };

  const categories = useMemo(() => (rows ? [...new Set(rows.map((q) => q.category))] : []), [rows]);

  const searching = query.trim() !== '' || difficulty !== 'All';
  const matchesFilter = (q: QuestionRow) => {
    if (difficulty !== 'All' && q.difficulty !== difficulty) return false;
    const needle = query.trim().toLowerCase();
    if (!needle) return true;
    return q.title.toLowerCase().includes(needle) || String(q.id) === needle;
  };

  const stats = useMemo(() => {
    if (!rows) return null;
    const diff = {
      Easy: { total: 0, solved: 0 },
      Medium: { total: 0, solved: 0 },
      Hard: { total: 0, solved: 0 },
    };
    for (const q of rows) {
      diff[q.difficulty].total++;
      if (solved.has(q.slug)) diff[q.difficulty].solved++;
    }
    return { total: rows.length, solved: solved.size, diff };
  }, [rows, solved]);

  if (!rows || !stats) {
    return <div className="panel serif">Loading questions…</div>;
  }

  return (
    <>
      <div className="viz-header">
        <div className="eyebrow">Interview prep, visualized</div>
        <h1 className="page-title">DSA Interview Questions</h1>
        <p className="serif desc">
          {stats.total} curated LeetCode problems organized by pattern. Every visualizer walks the optimal
          algorithm step by step, synced with the C++ and Java source.
        </p>
      </div>

      {session ? (
        <div className="panel progress-card">
          <div className="progress-ring-wrap">
            <div className="eyebrow" style={{ textAlign: 'center', marginBottom: '0.4rem' }}>
              Overall progress
            </div>
            <ProgressRing solved={stats.solved} total={stats.total} />
          </div>
          <div className="streak-block">
            <div className="streak-num mono">{streak.current}</div>
            <div className="streak-lbl">day streak</div>
            {streak.longest > streak.current && <div className="streak-best">best {streak.longest}</div>}
          </div>
          <div className="progress-diffs">
            {(['Easy', 'Medium', 'Hard'] as const).map((d) => {
              const dot = d === 'Easy' ? 'var(--accent-2)' : d === 'Medium' ? 'var(--accent)' : 'var(--accent-3)';
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
            <p className="serif diff-hint">
              Tick the circle next to a question to mark it solved — your progress is saved to your account.
            </p>
            {saveError && <p className="input-error">{saveError}</p>}
          </div>
        </div>
      ) : (
        <div className="panel progress-card signed-out">
          <div>
            <div className="eyebrow">Track your progress</div>
            <p className="serif" style={{ margin: '0.4rem 0 0' }}>
              Sign in to tick off solved questions and watch your progress ring fill up.
            </p>
          </div>
          <Link to="/login">
            <button className="btn primary">Sign in</button>
          </Link>
        </div>
      )}

      <div className="panel search-bar">
        <input
          type="search"
          className="search-input"
          placeholder="Search by title or #id…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search questions"
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

      {searching && rows.filter(matchesFilter).length === 0 && (
        <div className="panel serif" style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
          No questions match "{query || difficulty}".
        </div>
      )}

      {categories.map((cat) => {
        const catQuestions = rows.filter((q) => q.category === cat);
        const filtered = searching ? catQuestions.filter(matchesFilter) : catQuestions;
        if (searching && filtered.length === 0) return null;
        const questions = filtered;
        const catSolved = catQuestions.filter((q) => solved.has(q.slug)).length;
        const locked = isCategoryLocked(cat, session?.user);
        const isOpen = searching || !!open[cat];
        return (
          <section key={cat} className="panel cat">
            <button
              className="cat-head"
              onClick={() => setOpen((o) => ({ ...o, [cat]: !o[cat] }))}
              aria-expanded={isOpen}
            >
              <span className={`chev ${isOpen ? 'open' : ''}`}>▶</span>
              {cat}
              <span className="count">
                {searching
                  ? `${questions.length} match${questions.length === 1 ? '' : 'es'}`
                  : session
                    ? `${catSolved} / ${catQuestions.length} solved`
                    : `${catQuestions.length} questions`}
              </span>
              <span className="cat-progress" aria-hidden>
                <div style={{ width: `${session && !searching ? (catSolved / catQuestions.length) * 100 : 0}%` }} />
              </span>
            </button>
            {isOpen &&
              questions.map((q) => {
                const isSolved = solved.has(q.slug);
                return (
                  <div key={q.id} className={`qrow ${isSolved ? 'solved' : ''}`}>
                    <button
                      className={`qcheck ${isSolved ? 'on' : ''}`}
                      onClick={() => toggle(q.slug)}
                      aria-label={
                        session
                          ? `Mark ${q.title} as ${isSolved ? 'unsolved' : 'solved'}`
                          : 'Sign in to track progress'
                      }
                      title={session ? (isSolved ? 'Mark unsolved' : 'Mark solved') : 'Sign in to track progress'}
                    >
                      ✓
                    </button>
                    <span className="qid mono">#{q.id}</span>
                    <span className="qtitle">{q.title}</span>
                    <span className={`badge ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                    <span className="spacer" />
                    <a
                      className="lc-link"
                      href={q.leetcode}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${q.title} on LeetCode`}
                      title="Open on LeetCode"
                    >
                      <LeetCodeIcon />
                    </a>
                    {q.hasVisualizer ? (
                      locked ? (
                        <Link to="/upgrade">
                          <button className="btn primary locked" title="Upgrade to unlock">
                            🔒 Visualize
                          </button>
                        </Link>
                      ) : (
                        <Link to={`/visualize/${q.slug}`}>
                          <button className="btn primary">Visualize</button>
                        </Link>
                      )
                    ) : (
                      <span className="soon">coming soon</span>
                    )}
                  </div>
                );
              })}
          </section>
        );
      })}
      <p className="serif" style={{ color: 'var(--ink-faint)', fontSize: '0.8rem', textAlign: 'right' }}>
        data source: {source === 'api' ? 'API server' : 'local bundle'}
      </p>
    </>
  );
}
