import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { recommendations, scoreAttempt, type Breakdown, type ItemResult } from '../../aptitude/engine';
import { CATEGORY_BY_KEY } from '../../aptitude/taxonomy';
import type { Attempt, CategoryKey } from '../../aptitude/types';
import { Bar, DIFF_LABEL, QuestionBody, STATUS_LABEL, fmtDate, fmtDuration, launchTest, pct, useAptHistory, useAptUser } from '../../aptitude/ui';

const LETTERS = ['A', 'B', 'C', 'D'];
type Filter = 'all' | 'incorrect' | 'unattempted' | 'marked' | 'correct';

export default function AptitudeResult() {
  const { id = '' } = useParams();
  const { history } = useAptHistory();
  const attempt = history.find((a) => a.id === id);
  if (!attempt) return <Navigate to="/aptitude" replace />;
  return <ResultView attempt={attempt} history={history} />;
}

function ResultView({ attempt, history }: { attempt: Attempt; history: Attempt[] }) {
  const navigate = useNavigate();
  const { uid } = useAptUser();
  const r = useMemo(() => scoreAttempt(attempt), [attempt]);
  const recs = useMemo(() => recommendations(attempt, history.filter((a) => a.id !== attempt.id)), [attempt, history]);
  const [filter, setFilter] = useState<Filter>('all');

  const heading =
    attempt.status === 'timeout' ? "Time's up — test auto-submitted" : attempt.status === 'abandoned' ? 'Test abandoned' : 'Test completed';
  const shown = r.items.filter((it) =>
    filter === 'all'
      ? true
      : filter === 'incorrect'
        ? it.chosen !== null && !it.correct
        : filter === 'unattempted'
          ? it.chosen === null
          : filter === 'marked'
            ? it.marked
            : it.correct
  );
  const counts: Record<Filter, number> = {
    all: r.total,
    incorrect: r.incorrect,
    unattempted: r.unattempted,
    marked: r.items.filter((i) => i.marked).length,
    correct: r.correct,
  };

  return (
    <>
      <div className="viz-header">
        <Link to="/aptitude" className="apt-back">
          ← Aptitude &amp; OA
        </Link>
        <div className="eyebrow">{attempt.config.title}</div>
        <h1 className="page-title">{heading}</h1>
        <p className="faint apt-small" style={{ margin: '0.3rem 0 0' }}>
          {fmtDate(attempt.startedAt)} · {attempt.config.selection === 'smart' ? 'Smart selection' : 'Random selection'}
          {attempt.status !== 'submitted' && ` · ${STATUS_LABEL[attempt.status]}`}
        </p>
      </div>

      <div className="apt-result-hero">
        <div className="panel apt-score">
          <div className="apt-score-lbl">Score</div>
          <div className="apt-score-num mono">
            {r.correct}
            <span>/{r.total}</span>
          </div>
          <Bar value={r.scorePct} tone={r.scorePct >= 60 ? 'b' : 'a'} />
          <div className="faint apt-small">{Math.round(r.scorePct)}% of questions correct</div>
        </div>
        <div className="apt-result-tiles">
          <Tile num={`${Math.round(r.accuracyPct)}%`} lbl="Accuracy (of attempted)" />
          <Tile num={fmtDuration(r.timeTakenSec)} lbl={`Time taken of ${attempt.config.durationSec / 60} min`} />
          <Tile num={r.correct} lbl="Correct" tone="good" />
          <Tile num={r.incorrect} lbl="Incorrect" tone="bad" />
          <Tile num={r.unattempted} lbl="Unattempted" />
        </div>
      </div>

      <div className="apt-actions-row">
        <button className="btn primary" onClick={() => launchTest(navigate, uid, attempt.config)}>
          ↻ Practice again (new set)
        </button>
        <button className="btn" onClick={() => document.getElementById('review')?.scrollIntoView({ behavior: 'smooth' })}>
          Review answers ↓
        </button>
        <Link to="/aptitude/coverage" className="btn">
          Coverage
        </Link>
        <Link to="/aptitude" className="btn">
          Dashboard
        </Link>
      </div>

      <div className="apt-two">
        <div className="panel">
          <h3 className="apt-h3">Difficulty performance</h3>
          <BreakdownList rows={r.byDifficulty} />
          <h3 className="apt-h3" style={{ marginTop: '1.1rem' }}>
            Section performance
          </h3>
          <BreakdownList rows={r.byCategory} />
        </div>
        <div className="panel">
          <h3 className="apt-h3">Topic performance</h3>
          <BreakdownList rows={r.byTopic} sub={(b) => CATEGORY_BY_KEY[r.items.find((i) => i.q.topic === b.key)!.q.category as CategoryKey].short} />
        </div>
      </div>

      <h2 className="apt-h2">Recommended next practice</h2>
      <div className="apt-recs">
        {recs.map((rec) => (
          <div key={rec.label} className="panel apt-rec">
            <p className="apt-rec-reason">{rec.reason}</p>
            <div className="apt-rec-label">{rec.label}</div>
            <div className="faint apt-small mono">{rec.detail}</div>
            <button className="btn primary" onClick={() => launchTest(navigate, uid, rec.config)}>
              Start
            </button>
          </div>
        ))}
      </div>

      <h2 className="apt-h2" id="review">
        Question review
      </h2>
      <div className="apt-filter" role="tablist">
        {(Object.keys(counts) as Filter[]).map((f) => (
          <button key={f} role="tab" aria-selected={filter === f} className={`diff-chip${filter === f ? ' active all' : ''}`} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)} <span className="mono">{counts[f]}</span>
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="faint">No questions in this group.</p>}
      {shown.map((it) => (
        <ReviewItem key={it.q.id} it={it} />
      ))}
    </>
  );
}

function Tile({ num, lbl, tone }: { num: string | number; lbl: string; tone?: 'good' | 'bad' }) {
  return (
    <div className={`panel apt-stat${tone ? ` ${tone}` : ''}`}>
      <div className="num">{num}</div>
      <div className="lbl">{lbl}</div>
    </div>
  );
}

function BreakdownList({ rows, sub }: { rows: Breakdown[]; sub?: (b: Breakdown) => string }) {
  return (
    <ul className="apt-topic-list">
      {rows.map((b) => {
        const p = pct(b.correct, b.total);
        return (
          <li key={b.key}>
            <span className="apt-topic-name">
              {b.label}
              {sub && <span className="faint"> · {sub(b)}</span>}
            </span>
            <Bar value={p} tone={p >= 60 ? 'b' : p >= 40 ? 'a' : 'bad'} />
            <span className="mono apt-small">
              {b.correct}/{b.total}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function ReviewItem({ it }: { it: ItemResult }) {
  const { q, order, chosen } = it;
  const letterOf = (orig: number | null) => (orig === null ? '—' : LETTERS[order.indexOf(orig)]);
  const verdict = chosen === null ? 'skipped' : it.correct ? 'right' : 'wrong';
  return (
    <article className={`panel apt-review ${verdict}`}>
      <div className="apt-review-head">
        <span className="apt-q-num">Question {it.index + 1}</span>
        <span className={`apt-verdict ${verdict}`}>{verdict === 'right' ? '✓ Correct' : verdict === 'wrong' ? '✗ Incorrect' : '— Not attempted'}</span>
        <span className="apt-spacer" />
        <span className="faint apt-small">
          {q.topic} · {q.subtopic}
        </span>
        <span className={`badge ${q.difficulty}`}>{DIFF_LABEL[q.difficulty]}</span>
      </div>
      <QuestionBody q={q} />
      <ul className="apt-review-options">
        {order.map((orig, pos) => (
          <li key={pos} className={orig === q.correctAnswer ? 'correct' : orig === chosen ? 'chosen' : ''}>
            <span className="apt-option-letter">{LETTERS[pos]}</span>
            <span>{q.options[orig]}</span>
            {orig === q.correctAnswer && <span className="apt-tag good">Correct answer</span>}
            {orig === chosen && orig !== q.correctAnswer && <span className="apt-tag bad">Your answer</span>}
          </li>
        ))}
      </ul>
      <div className="apt-review-answers apt-small">
        Your answer: <b className="mono">{letterOf(chosen)}</b> · Correct answer: <b className="mono">{letterOf(q.correctAnswer)}</b>
        {it.marked && <span className="apt-flag">Marked for review</span>}
      </div>
      <div className="apt-explain">
        <b>Explanation.</b> {q.explanation}
      </div>
    </article>
  );
}
