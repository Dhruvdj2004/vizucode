// Shared React pieces for the Aptitude pages: the session/history hook, test
// launching, formatting, and the question body renderer used both during the
// test and in the post-test review.
import { useEffect, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { getSession } from '../lib/auth';
import { generateTest } from './engine';
import { getActive, loadHistory, resolveActive, setActive, syncHistory } from './store';
import type { AptQuestion, Attempt, Difficulty, TestConfig } from './types';

/** The signed-in user (these pages all sit behind RequireAuth). */
export function useAptUser() {
  const s = getSession();
  return { uid: s?.user.id ?? 0, token: s?.token };
}

/** Local history immediately, then merged with the server copy once it arrives. */
export function useAptHistory() {
  const { uid, token } = useAptUser();
  const [state, setState] = useState(() => {
    resolveActive(uid, token); // a test whose clock ran out while away is auto-submitted
    return { history: loadHistory(uid), active: getActive(uid) };
  });
  useEffect(() => {
    if (!token) return;
    let live = true;
    syncHistory(uid, token).then((history) => {
      if (live) setState({ history, active: getActive(uid) });
    });
    return () => {
      live = false;
    };
  }, [uid, token]);
  return state;
}

/** Builds a fresh test from `config` and opens the test screen. */
export function launchTest(navigate: NavigateFunction, uid: number, config: TestConfig) {
  const attempt = generateTest(config, loadHistory(uid));
  setActive(uid, attempt);
  navigate('/aptitude/test');
}

export const fmtClock = (sec: number) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

export const fmtDuration = (sec: number) => {
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  return m ? `${m}m ${String(s % 60).padStart(2, '0')}s` : `${s}s`;
};

export const fmtDate = (t: number) =>
  new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);

export const DIFF_LABEL: Record<Difficulty, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

export const STATUS_LABEL: Record<Attempt['status'], string> = {
  active: 'In progress',
  submitted: 'Submitted',
  timeout: 'Auto-submitted',
  abandoned: 'Abandoned',
};

/** Horizontal progress bar; `tone` picks the accent. */
export function Bar({ value, tone = 'a' }: { value: number; tone?: 'a' | 'b' | 'c' | 'bad' }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <span className={`apt-bar tone-${tone}`} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${v}%` }} />
    </span>
  );
}

/** Passage, table, code and question stem — everything above the options. */
export function QuestionBody({ q }: { q: AptQuestion }) {
  const [stem, ...rest] = q.question.split('\n');
  return (
    <>
      {q.passage && <p className="apt-passage">{q.passage}</p>}
      {q.table && (
        <div className="apt-table-wrap">
          <table className="apt-table">
            {q.table.caption && <caption>{q.table.caption}</caption>}
            <thead>
              <tr>
                {q.table.head.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {q.table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {q.code && <pre className="apt-code">{q.code}</pre>}
      <p className="apt-stem">{stem}</p>
      {rest.length > 0 && (
        <div className="apt-stem-lines">
          {rest.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </>
  );
}
