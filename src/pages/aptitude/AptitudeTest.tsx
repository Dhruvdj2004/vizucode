import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { QUESTION_BY_ID } from '../../aptitude/bank';
import { deadlineOf } from '../../aptitude/engine';
import { finishAttempt, getActive, setActive } from '../../aptitude/store';
import type { Attempt, AttemptStatus } from '../../aptitude/types';
import { QuestionBody, fmtClock, useAptUser } from '../../aptitude/ui';

const WARN_AT = [10, 5, 1]; // minutes remaining
const LETTERS = ['A', 'B', 'C', 'D'];

type Modal = { kind: 'submit' } | { kind: 'leave'; to: string } | null;

export default function AptitudeTest() {
  const { uid, token } = useAptUser();
  const navigate = useNavigate();
  // An attempt whose clock already ran out (tab closed past the deadline) is
  // picked up by the timer effect below and auto-submitted on first tick.
  const [attempt, setAttempt] = useState<Attempt | null>(() => getActive(uid));
  const [now, setNow] = useState(Date.now);
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const done = useRef(false);

  const update = useCallback(
    (fn: (a: Attempt) => Attempt) => {
      setAttempt((prev) => {
        if (!prev || done.current) return prev;
        const next = fn(prev);
        setActive(uid, next);
        return next;
      });
    },
    [uid]
  );

  const finish = useCallback(
    (status: Exclude<AttemptStatus, 'active'>, then?: string) => {
      if (done.current) return;
      // Re-read storage so a submit never loses the last answer to a stale closure.
      const latest = getActive(uid) ?? attempt;
      if (!latest) return;
      done.current = true;
      const fin = finishAttempt(uid, latest, status, token);
      navigate(then ?? `/aptitude/result/${fin.id}`, { replace: !then });
    },
    [uid, token, attempt, navigate]
  );

  // Clock: derived from the stored start time, so a refresh never resets it.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const remaining = attempt ? (deadlineOf(attempt) - now) / 1000 : 0;

  useEffect(() => {
    if (!attempt || done.current) return;
    if (remaining <= 0) {
      finish('timeout');
      return;
    }
    const due = WARN_AT.filter((m) => remaining <= m * 60 && !attempt.warned.includes(m));
    if (due.length) {
      const m = Math.min(...due);
      setToast(m === 1 ? '1 minute remaining — the test will submit automatically.' : `${m} minutes remaining.`);
      update((a) => ({ ...a, warned: [...a.warned, ...due] }));
    }
  }, [remaining, attempt, finish, update]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  // Leaving: the browser's own prompt on refresh/close (the test resumes after
  // a refresh), and our confirm dialog for in-app links (leaving abandons it).
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (done.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    const onClick = (e: MouseEvent) => {
      if (done.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest?.('a[href]');
      const href = a?.getAttribute('href');
      if (!href?.startsWith('#/')) return;
      e.preventDefault();
      e.stopPropagation();
      setModal({ kind: 'leave', to: href.slice(1) });
    };
    window.addEventListener('beforeunload', onUnload);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  const go = useCallback(
    (i: number) =>
      update((a) => {
        const idx = Math.max(0, Math.min(a.questionIds.length - 1, i));
        const visited = [...a.visited];
        visited[idx] = true;
        return { ...a, current: idx, visited };
      }),
    [update]
  );

  const choose = useCallback(
    (orig: number | null) =>
      update((a) => {
        const answers = [...a.answers];
        answers[a.current] = orig;
        return { ...a, answers };
      }),
    [update]
  );

  // Keyboard: 1–4 / A–D pick an option, ← → move between questions.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!attempt || modal || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea, select')) return;
      const k = e.key.toUpperCase();
      const pos = '1234'.indexOf(k) >= 0 ? '1234'.indexOf(k) : 'ABCD'.indexOf(k);
      if (pos >= 0 && k.length === 1) choose(attempt.optionOrder[attempt.current][pos]);
      else if (e.key === 'ArrowRight') go(attempt.current + 1);
      else if (e.key === 'ArrowLeft') go(attempt.current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [attempt, modal, choose, go]);

  if (!attempt) return <Navigate to="/aptitude" replace />;

  const total = attempt.questionIds.length;
  const i = attempt.current;
  const q = QUESTION_BY_ID.get(attempt.questionIds[i]);
  const order = attempt.optionOrder[i];
  const chosen = attempt.answers[i];
  const answered = attempt.answers.filter((x) => x !== null).length;
  const markedCount = attempt.marked.filter(Boolean).length;
  const low = remaining <= 60 ? 'crit' : remaining <= 300 ? 'low' : '';

  const cellState = (k: number) => {
    const ans = attempt.answers[k] !== null;
    if (ans && attempt.marked[k]) return 'ans-marked';
    if (attempt.marked[k]) return 'marked';
    if (ans) return 'answered';
    return attempt.visited[k] ? 'visited' : 'fresh';
  };

  return (
    <div className="apt-test">
      <div className="apt-topbar">
        <div className="apt-topbar-title">
          <span className="apt-topbar-name">{attempt.config.title}</span>
          <span className="apt-topbar-q mono">
            Question {i + 1} / {total}
          </span>
        </div>
        <div className="apt-topbar-progress" title={`${answered} of ${total} answered`}>
          <span style={{ width: `${(answered / total) * 100}%` }} />
        </div>
        <div className={`apt-timer mono ${low}`} aria-live="off">
          <span className="apt-timer-lbl">Time left</span>
          {fmtClock(remaining)}
        </div>
        <button className="btn apt-palette-toggle" onClick={() => setPaletteOpen((o) => !o)} aria-expanded={paletteOpen}>
          {paletteOpen ? 'Hide questions' : 'All questions'}
        </button>
      </div>

      {toast && (
        <div className="apt-toast" role="alert">
          ⏱ {toast}
        </div>
      )}

      <div className="apt-test-grid">
        <main className="panel apt-question">
          {q ? (
            <>
              <div className="apt-q-head">
                <span className="apt-q-num">Question {i + 1}</span>
                {attempt.marked[i] && <span className="apt-flag">Marked for review</span>}
              </div>
              <QuestionBody q={q} />
              <div className="apt-options" role="radiogroup" aria-label={`Options for question ${i + 1}`}>
                {order.map((orig, pos) => (
                  <label key={pos} className={`apt-option${chosen === orig ? ' on' : ''}`}>
                    <input type="radio" name={`q-${i}`} checked={chosen === orig} onChange={() => choose(orig)} />
                    <span className="apt-option-letter">{LETTERS[pos]}</span>
                    <span className="apt-option-text">{q.options[orig]}</span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <p className="faint">This question is no longer in the bank — skip it.</p>
          )}
          <div className="apt-q-actions">
            <button className="btn" onClick={() => go(i - 1)} disabled={i === 0}>
              ← Previous
            </button>
            <button className="btn" onClick={() => choose(null)} disabled={chosen === null}>
              Clear answer
            </button>
            <button
              className={`btn apt-mark-btn${attempt.marked[i] ? ' on' : ''}`}
              onClick={() =>
                update((a) => {
                  const marked = [...a.marked];
                  marked[a.current] = !marked[a.current];
                  return { ...a, marked };
                })
              }
            >
              {attempt.marked[i] ? '★ Unmark review' : '☆ Mark for review'}
            </button>
            <span className="apt-spacer" />
            {i < total - 1 ? (
              <button className="btn primary" onClick={() => go(i + 1)}>
                {chosen !== null ? 'Save & next →' : 'Next →'}
              </button>
            ) : (
              <button className="btn primary" onClick={() => setModal({ kind: 'submit' })}>
                Submit test
              </button>
            )}
          </div>
        </main>

        <aside className={`panel apt-palette${paletteOpen ? ' open' : ''}`}>
          <div className="apt-palette-head">
            <b>Questions</b>
            <span className="faint mono apt-small">
              {answered}/{total} answered
            </span>
          </div>
          <div className="apt-palette-grid">
            {attempt.questionIds.map((id, k) => (
              <button
                key={id}
                className={`apt-cell ${cellState(k)}${k === i ? ' current' : ''}`}
                onClick={() => {
                  go(k);
                  setPaletteOpen(false);
                }}
                aria-label={`Question ${k + 1}`}
                aria-current={k === i}
              >
                {k + 1}
              </button>
            ))}
          </div>
          <ul className="apt-legend">
            <li>
              <span className="apt-cell answered" /> Answered
            </li>
            <li>
              <span className="apt-cell visited" /> Visited, not answered
            </li>
            <li>
              <span className="apt-cell fresh" /> Not visited
            </li>
            <li>
              <span className="apt-cell marked" /> Marked for review
            </li>
            <li>
              <span className="apt-cell ans-marked" /> Answered &amp; marked
            </li>
          </ul>
          <button className="btn primary apt-submit" onClick={() => setModal({ kind: 'submit' })}>
            Submit test
          </button>
        </aside>
      </div>

      {modal && (
        <div className="apt-modal-backdrop" role="presentation" onClick={() => setModal(null)}>
          <div className="panel apt-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            {modal.kind === 'submit' ? (
              <>
                <h3>Submit test?</h3>
                <ul className="apt-modal-stats">
                  <li>
                    <b className="mono">{answered}</b> answered
                  </li>
                  <li>
                    <b className="mono">{total - answered}</b> unanswered
                  </li>
                  <li>
                    <b className="mono">{markedCount}</b> marked for review
                  </li>
                  <li>
                    <b className="mono">{fmtClock(remaining)}</b> left
                  </li>
                </ul>
                <p className="faint apt-small">You can't change answers after submitting.</p>
                <div className="apt-modal-actions">
                  <button className="btn" onClick={() => setModal(null)} autoFocus>
                    Keep working
                  </button>
                  <button className="btn primary" onClick={() => finish('submitted')}>
                    Submit
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Leave the test?</h3>
                <p>Your test is in progress. Are you sure you want to leave?</p>
                <p className="faint apt-small">Leaving ends this attempt. It will be saved as abandoned, with the answers you have given so far.</p>
                <div className="apt-modal-actions">
                  <button className="btn primary" onClick={() => setModal(null)} autoFocus>
                    Stay on test
                  </button>
                  <button className="btn" onClick={() => finish('abandoned', modal.to)}>
                    Leave &amp; abandon
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
