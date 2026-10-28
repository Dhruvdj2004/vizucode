// Home dashboard. The centrepiece is "your prep, as an array": every DSA
// topic is drawn as an array cell that fills up as you solve it, with a
// pointer under the topic to do next — the visualizer's own language,
// applied to the student's progress.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNews, fetchProgress, fetchQuestions, type NewsItem, type QuestionRow, type Streak } from '../lib/api';
import { getSession, onAuthChange } from '../lib/auth';
import { isCategoryLocked } from '../lib/plan';
import { fetchInterviewHome, type InterviewHome } from '../lib/interview';
import { CORE_MODULES, REVISION_MODULES } from '../content/registry';
import { moduleStats } from '../content/module';
import { Icon } from '../components/Icon';
import { RESUME_READY } from '../lib/resume';
import InterviewerBot from './interview/InterviewerBot';

interface Cell {
  index: number;
  name: string;
  solved: number;
  total: number;
  locked: boolean;
}

function greeting(d = new Date()): string {
  const h = d.getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const today = () =>
  new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export default function DashboardPage() {
  const [session, setSession] = useState(getSession);
  const [rows, setRows] = useState<QuestionRow[] | null>(null);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState<Streak>({ current: 0, longest: 0 });
  const [iv, setIv] = useState<InterviewHome | null>(null);
  const [news, setNews] = useState<NewsItem | null>(null);

  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  useEffect(() => {
    document.title = 'Dashboard — VizuCode';
    let live = true;
    fetchQuestions().then(({ rows }) => live && setRows(rows));
    fetchNews()
      .then((d) => live && setNews(d.items[0] ?? null))
      .catch(() => {});
    return () => {
      live = false;
      document.title = 'VizuCode — LeetCode Visualizer';
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let live = true;
    fetchProgress(session.token)
      .then((p) => {
        if (!live) return;
        setSolved(p.solved);
        setStreak(p.streak);
      })
      .catch(() => {});
    fetchInterviewHome()
      .then((h) => live && setIv(h))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [session]);

  const cells = useMemo<Cell[]>(() => {
    if (!rows) return [];
    const order: string[] = [];
    const by = new Map<string, Cell>();
    for (const q of rows) {
      let c = by.get(q.category);
      if (!c) {
        c = { index: order.length, name: q.category, solved: 0, total: 0, locked: isCategoryLocked(q.category, session?.user) };
        by.set(q.category, c);
        order.push(q.category);
      }
      c.total++;
      if (solved.has(q.slug)) c.solved++;
    }
    return order.map((n) => by.get(n)!);
  }, [rows, solved, session]);

  // The pointer: the first open topic that isn't finished yet.
  const nextCell = cells.find((c) => !c.locked && c.solved < c.total) ?? null;
  const nextQ = useMemo(
    () => (rows && nextCell ? rows.find((q) => q.category === nextCell.name && !solved.has(q.slug)) ?? null : null),
    [rows, nextCell, solved]
  );
  const total = rows?.length ?? 0;
  // Count only main-list questions — Code Catalyst ticks live in the same set.
  const done = cells.reduce((n, c) => n + c.solved, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const lastIv = iv?.interviews[0];
  const coreTopics = CORE_MODULES.reduce((n, m) => n + moduleStats(m.mod).topics, 0);

  if (!rows) return <div className="page-loading">Loading your dashboard…</div>;

  return (
    <main className="dash">
      {/* ---------- hero: greeting + the one thing to do next ---------- */}
      <section className="dash-hero">
        <div className="dash-hello">
          <div className="dash-trace mono">
            <span className="faint">// {today()}</span>
            {streak.current > 0 ? (
              <span>
                <Icon name="flame" /> day {streak.current} streak
              </span>
            ) : (
              <span className="faint">start a streak today</span>
            )}
          </div>
          <h1 className="dash-title">
            {greeting()}, {session?.user.firstName ?? 'there'}.
          </h1>
          <p className="dash-sub">
            {done === 0
              ? 'Pick up your first problem below — every one of them is a step-by-step visual.'
              : `You've solved ${done} of ${total} problems. ${pct >= 50 ? 'More than halfway there.' : 'Keep the pointer moving.'}`}
          </p>
        </div>

        <div className="panel dash-next">
          <div className="eyebrow">Next up</div>
          {nextQ ? (
            <>
              <div className="dash-next-q">
                <span className="mono faint">#{nextQ.id}</span>
                <span className="dash-next-title">{nextQ.title}</span>
              </div>
              <div className="dash-next-meta">
                <span className={`badge ${nextQ.difficulty.toLowerCase()}`}>{nextQ.difficulty}</span>
                <span className="faint">{nextQ.category}</span>
              </div>
              <div className="dash-next-actions">
                <Link to={`/visualize/${nextQ.slug}`} className="btn primary">
                  <Icon name="play" /> Visualize
                </Link>
                <Link to={`/dsa?cat=${encodeURIComponent(nextQ.category)}`} className="btn">
                  Open topic
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="dash-next-title">Every open topic is done.</p>
              <Link to="/upgrade" className="btn primary">
                <Icon name="unlock" /> Unlock the rest
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ---------- your prep, as an array ---------- */}
      <section className="panel dash-array-panel">
        <div className="dash-array-head">
          <div>
            <h2 className="dash-h2">Your prep, as an array</h2>
            <p className="faint dash-small">
              One cell per DSA topic, filled as you solve. <span className="mono">i</span> points at what to do next.
            </p>
          </div>
          <div className="dash-array-stats mono">
            <span>
              <b>{done}</b>/{total} solved
            </span>
            <span>
              <b>{pct}</b>%
            </span>
            <span>
              best streak <b>{streak.longest}</b>
            </span>
          </div>
        </div>
        <ol className="dash-array" aria-label="Progress by topic">
          {cells.map((c) => {
            const fill = c.total ? c.solved / c.total : 0;
            const isNext = nextCell?.index === c.index;
            return (
              <li key={c.name} className={`dash-cell-wrap ${isNext ? 'next' : ''}`}>
                <Link
                  to={c.locked ? '/upgrade' : `/dsa?cat=${encodeURIComponent(c.name)}`}
                  className={`dash-cell ${c.locked ? 'locked' : ''} ${fill === 1 ? 'full' : ''}`}
                  title={`${c.name}: ${c.solved}/${c.total} solved${c.locked ? ' (Pro)' : ''}`}
                >
                  <span className="dash-cell-fill" style={{ height: `${fill * 100}%` }} />
                  <span className="dash-cell-val mono">
                    {c.locked ? <Icon name="lock" /> : `${c.solved}/${c.total}`}
                  </span>
                </Link>
                <span className="dash-cell-idx mono">{c.index}</span>
                <span className="dash-cell-name">{c.name}</span>
                {isNext && (
                  <span className="dash-ptr mono" aria-label="Next topic">
                    ▲ i
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------- practice modes ---------- */}
      <section className="dash-grid">
        <Link to="/interview" className="panel dash-card dash-iv">
          <div className="dash-iv-bot">
            <InterviewerBot mood="idle" size={120} showStatus={false} />
          </div>
          <div className="dash-card-body">
            <div className="eyebrow">AI mock interview</div>
            <h3 className="dash-card-title">Practice your interview, out loud</h3>
            <p className="dash-card-text">
              Vizu reads your resume and asks about your own projects. You answer by voice and get scored on every
              answer.
            </p>
            <div className="dash-card-foot mono">
              {lastIv
                ? lastIv.overall !== null
                  ? `last score ${lastIv.overall}/10`
                  : `${lastIv.answered}/${lastIv.total} answered · continue`
                : iv
                  ? iv.left > 0
                    ? `${iv.left} free interview${iv.left === 1 ? '' : 's'} left`
                    : `₹${iv.price} per interview`
                  : 'start your first one'}
              <Icon name="arrow-right" />
            </div>
          </div>
        </Link>

        <Link to="/resume" className="panel dash-card">
          <span className="dash-card-icon c">
            <Icon name="file-text" size={20} />
          </span>
          <h3 className="dash-card-title">
            Resume editor{!RESUME_READY && <span className="nav-soon">soon</span>}
          </h3>
          <p className="dash-card-text">Upload your resume and ask for changes in plain English. Download the PDF or LaTeX.</p>
          <div className="dash-card-foot mono">
            {RESUME_READY ? 'edit resume' : 'in progress'} <Icon name="arrow-right" />
          </div>
        </Link>

        <Link to="/aptitude" className="panel dash-card">
          <span className="dash-card-icon b">
            <Icon name="timer" size={20} />
          </span>
          <h3 className="dash-card-title">Aptitude &amp; OA</h3>
          <p className="dash-card-text">Timed 20-minute tests in the style of TCS, Infosys and Accenture.</p>
          <div className="dash-card-foot mono">
            take a test <Icon name="arrow-right" />
          </div>
        </Link>

        <Link to="/core" className="panel dash-card">
          <span className="dash-card-icon c">
            <Icon name="database" size={20} />
          </span>
          <h3 className="dash-card-title">Core subjects</h3>
          <p className="dash-card-text">DBMS, OS, OOP, CN, SQL and System Design, drawn as diagrams.</p>
          <div className="dash-card-foot mono">
            {coreTopics} topics <Icon name="arrow-right" />
          </div>
        </Link>

        <Link to="/revision" className="panel dash-card">
          <span className="dash-card-icon">
            <Icon name="book" size={20} />
          </span>
          <h3 className="dash-card-title">Revision notes</h3>
          <p className="dash-card-text">{REVISION_MODULES[0]?.tagline ?? 'Graphs and DP in plain language.'}</p>
          <div className="dash-card-foot mono">
            revise <Icon name="arrow-right" />
          </div>
        </Link>

        <Link to="/news" className="panel dash-card dash-news">
          <div className="eyebrow">Top AI story today</div>
          <h3 className="dash-card-title">{news ? news.headline : 'Today’s top 5 in AI'}</h3>
          {news && <p className="dash-card-text">{news.summary}</p>}
          <div className="dash-card-foot mono">
            {news ? news.source : 'updated 7 AM IST'} <Icon name="arrow-right" />
          </div>
        </Link>
      </section>
    </main>
  );
}
