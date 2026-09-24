import { Link } from 'react-router-dom';
import { dashboardStats, deadlineOf, scoreAttempt } from '../../aptitude/engine';
import { CATEGORIES, CATEGORY_BY_KEY } from '../../aptitude/taxonomy';
import { QUESTION_BANK } from '../../aptitude/bank';
import { Bar, STATUS_LABEL, fmtClock, fmtDate, fmtDuration, pct, useAptHistory } from '../../aptitude/ui';

const MODES = [
  { key: 'full', icon: '📝', title: 'Full Test', meta: '20 questions · 20 min', desc: 'Pick any mix of topics. Balanced 8 easy / 6 medium / 6 hard.' },
  { key: 'topic', icon: '🎯', title: 'Topic Practice', meta: '10 or 20 questions', desc: 'Drill one topic — e.g. Percentages or Syllogisms — at the level you choose.' },
  { key: 'mixed', icon: '🔀', title: 'Mixed Practice', meta: '20 questions · 20 min', desc: 'Quant, logical, analytical and verbal, all in one sitting.' },
  { key: 'cs', icon: '💻', title: 'Core CS OA', meta: '20 questions · 20 min', desc: 'DBMS, OS, networks, OOP, DSA and code-output questions.' },
  { key: 'company', icon: '🏢', title: 'Company-style OA', meta: '20 questions · 20 min', desc: 'Section mixes in the style of TCS, Infosys, Accenture and others.' },
] as const;

export default function AptitudeHome() {
  const { history, active } = useAptHistory();
  const stats = dashboardStats(history);
  const recent = history.filter((a) => a.status !== 'active').slice(0, 8);
  const isNew = recent.length === 0;

  return (
    <>
      <div className="viz-header">
        <div className="eyebrow">Placement prep</div>
        <h1 className="page-title">Aptitude &amp; OA Practice</h1>
        <p className="serif desc">
          Timed, placement-style tests drawn from a bank of {QUESTION_BANK.length} questions across{' '}
          {CATEGORIES.length} sections. Every attempt is a fresh random set; explanations come after you submit.
        </p>
      </div>

      {active && (
        <div className="panel apt-resume">
          <div>
            <b>Test in progress:</b> {active.config.title} — {active.answers.filter((x) => x !== null).length}/
            {active.questionIds.length} answered, <span className="mono">{fmtClock((deadlineOf(active) - Date.now()) / 1000)}</span> left
          </div>
          <Link to="/aptitude/test" className="btn primary">
            Resume test →
          </Link>
        </div>
      )}

      <div className="apt-stats">
        <Stat num={stats.totalQuestions} lbl="Questions in bank" />
        <Stat num={stats.attemptedUnique} lbl="Questions attempted" />
        <Stat num={stats.correctUnique} lbl="Solved correctly" />
        <Stat num={stats.answered ? `${Math.round(stats.accuracyPct)}%` : '—'} lbl="Accuracy" />
        <Stat num={stats.testsCompleted} lbl="Tests completed" />
        <Stat num={stats.testsCompleted ? `${Math.round(stats.avgScorePct)}%` : '—'} lbl="Average score" />
        <Stat num={stats.testsCompleted ? fmtDuration(stats.avgTimeSec) : '—'} lbl="Average time" />
        <Stat num={`${stats.streak} 🔥`} lbl={stats.streak === 1 ? 'Day streak' : 'Days streak'} />
      </div>

      <Link to="/aptitude/coverage" className="panel apt-coverage-cta">
        <div className="apt-coverage-cta-head">
          <span>
            <b>Question bank coverage</b>
            <span className="faint"> · {Math.round(stats.coveragePct)}% seen</span>
          </span>
          <span className="apt-link">View by topic →</span>
        </div>
        <Bar value={stats.coveragePct} tone="b" />
      </Link>

      <h2 className="apt-h2">Start practising</h2>
      <div className="apt-modes">
        {MODES.map((m) => (
          <Link key={m.key} to={`/aptitude/start/${m.key}`} className="panel apt-mode">
            <span className="apt-mode-icon" aria-hidden>
              {m.icon}
            </span>
            <span className="apt-mode-title">{m.title}</span>
            <span className="apt-mode-meta mono">{m.meta}</span>
            <span className="apt-mode-desc">{m.desc}</span>
          </Link>
        ))}
      </div>

      {isNew ? (
        <div className="panel apt-empty">
          <b>No attempts yet.</b> Start with a <Link to="/aptitude/start/mixed">Mixed Practice</Link> test to get a baseline — your
          strongest and weakest topics, coverage and recommendations appear here after the first test.
        </div>
      ) : (
        <div className="apt-two">
          <div className="panel">
            <h3 className="apt-h3">Strongest topics</h3>
            <TopicList items={stats.strongest} empty="Answer at least 3 questions in a topic to rank it." />
            <h3 className="apt-h3" style={{ marginTop: '1.1rem' }}>
              Needs work
            </h3>
            <TopicList items={stats.weakest} empty="Nothing below 75% accuracy yet — keep going." weak />
          </div>
          <div className="panel">
            <h3 className="apt-h3">Recent attempts</h3>
            <ul className="apt-recent">
              {recent.map((a) => {
                const r = scoreAttempt(a);
                return (
                  <li key={a.id}>
                    <Link to={`/aptitude/result/${a.id}`}>
                      <span className="apt-recent-title">{a.config.title}</span>
                      <span className="apt-recent-meta faint">
                        {fmtDate(a.startedAt)} · {fmtDuration(r.timeTakenSec)}
                        {a.status !== 'submitted' && ` · ${STATUS_LABEL[a.status]}`}
                      </span>
                      <span className="apt-recent-score mono">
                        {r.correct}/{r.total}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

function Stat({ num, lbl }: { num: string | number; lbl: string }) {
  return (
    <div className="panel apt-stat">
      <div className="num">{num}</div>
      <div className="lbl">{lbl}</div>
    </div>
  );
}

function TopicList({ items, empty, weak }: { items: ReturnType<typeof dashboardStats>['strongest']; empty: string; weak?: boolean }) {
  if (!items.length) return <p className="faint apt-small">{empty}</p>;
  return (
    <ul className="apt-topic-list">
      {items.map((t) => (
        <li key={t.topic}>
          <span className="apt-topic-name">
            {t.topic}
            <span className="faint"> · {CATEGORY_BY_KEY[t.category].short}</span>
          </span>
          <Bar value={t.accuracy} tone={weak ? 'bad' : 'b'} />
          <span className="mono apt-small">
            {pct(t.correct, t.answered)}% <span className="faint">({t.correct}/{t.answered})</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
