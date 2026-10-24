import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  getTeacherSession,
  teacherApi,
  teacherLogout,
  type Difficulty,
  type QuestionDraft,
  type RequestSummary,
} from '../../lib/teacher';

const EMPTY: QuestionDraft = {
  title: '',
  difficulty: 'Medium',
  category: 'Arrays & Hashing',
  description: '',
  examples: [{ input: '', output: '', explanation: '' }],
  constraints: '',
  hiddenTests: [],
  sourceUrl: '',
  notes: '',
};

export default function TeacherPage() {
  const navigate = useNavigate();
  const session = getTeacherSession();
  const [categories, setCategories] = useState<string[]>([]);
  const [requests, setRequests] = useState<RequestSummary[] | null>(null);
  const [draft, setDraft] = useState<QuestionDraft>(EMPTY);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    if (!session) return;
    teacherApi
      .me()
      .then((r) => setCategories(r.categories))
      .catch(() => navigate('/teacher/login'));
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return <Navigate to="/teacher/login" replace />;

  function refresh() {
    teacherApi
      .list()
      .then((r) => setRequests(r.requests))
      .catch((e) => setError(e.message));
  }

  const set = <K extends keyof QuestionDraft>(k: K, v: QuestionDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  async function onScrape() {
    setScrapeMsg(null);
    setError(null);
    setScraping(true);
    try {
      const { question: q } = await teacherApi.scrape(scrapeUrl);
      setDraft((d) => ({
        ...d,
        title: q.title ?? d.title,
        difficulty: (q.difficulty as Difficulty) ?? d.difficulty,
        category: q.category ?? d.category,
        description: q.description ?? d.description,
        examples: q.examples?.length
          ? q.examples.map((e) => ({ input: e.input ?? '', output: e.output ?? '', explanation: e.explanation ?? '' }))
          : d.examples,
        constraints: q.constraints ?? d.constraints,
        sourceUrl: q.sourceUrl ?? scrapeUrl,
      }));
      setScrapeMsg(
        `Filled from ${q.source ?? 'the page'}${q.tags?.length ? ` (tags: ${q.tags.slice(0, 6).join(', ')})` : ''}. Check every field before sending.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scraping failed.');
    } finally {
      setScraping(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);
    setBusy(true);
    try {
      const r = await teacherApi.create({
        ...draft,
        examples: draft.examples.filter((x) => x.input || x.output),
        hiddenTests: draft.hiddenTests.filter((x) => x.input || x.output),
      });
      setSaved(
        r.alreadyOnSite
          ? `Sent as request (#${r.id}). Note: VizuCode already has a visualizer for "${r.slug}".`
          : `Sent! Request #${r.id} is waiting for review.`
      );
      setDraft(EMPTY);
      setScrapeUrl('');
      setScrapeMsg(null);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tp-wrap">
      <div className="tp-head">
        <div>
          <div className="eyebrow">Teacher panel</div>
          <h1 className="page-title">Hi, {session.teacher.name}</h1>
          <p className="serif desc">Request a step-by-step visualization for any DSA question.</p>
        </div>
        <button
          className="btn"
          onClick={() => {
            teacherLogout();
            navigate('/teacher/login');
          }}
        >
          Sign out
        </button>
      </div>

      <form className="panel" onSubmit={onSubmit} noValidate>
        <h2 style={{ marginTop: 0 }}>New request</h2>

        <div className="tp-field">
          <label htmlFor="src-url">Question link (LeetCode, GeeksforGeeks, CodeChef…): optional</label>
          <div className="tp-row">
            <input
              id="src-url"
              className="tp-input grow"
              placeholder="https://leetcode.com/problems/two-sum/"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
            />
            <button type="button" className="btn" onClick={onScrape} disabled={!scrapeUrl || scraping}>
              {scraping ? 'Fetching…' : 'Fetch & auto-fill'}
            </button>
          </div>
          {scrapeMsg && <div className="tp-ok">{scrapeMsg}</div>}
        </div>

        <div className="tp-grid">
          <div className="tp-field">
            <label htmlFor="q-title">Title</label>
            <input id="q-title" value={draft.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="tp-field">
            <label htmlFor="q-diff">Difficulty</label>
            <select id="q-diff" value={draft.difficulty} onChange={(e) => set('difficulty', e.target.value as Difficulty)}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div className="tp-field">
            <label htmlFor="q-cat">Topic</label>
            <select id="q-cat" value={draft.category} onChange={(e) => set('category', e.target.value)}>
              {(categories.length ? categories : [draft.category]).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="tp-field">
          <label htmlFor="q-desc">Problem statement</label>
          <textarea id="q-desc" value={draft.description} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div className="tp-field">
          <label>Examples (sample test cases): the first one becomes the visualizer's default input</label>
          {draft.examples.map((ex, i) => (
            <div className="tp-example" key={i}>
              <div className="tp-grid">
                {(['input', 'output', 'explanation'] as const).map((k) => (
                  <div className="tp-field" key={k} style={{ marginBottom: 0 }}>
                    <label>
                      {k[0].toUpperCase() + k.slice(1)} {i + 1}
                    </label>
                    <textarea
                      className="mono"
                      value={ex[k]}
                      onChange={(e) =>
                        set(
                          'examples',
                          draft.examples.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x))
                        )
                      }
                    />
                  </div>
                ))}
              </div>
              {draft.examples.length > 1 && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => set('examples', draft.examples.filter((_, j) => j !== i))}
                >
                  Remove example
                </button>
              )}
            </div>
          ))}
          <div>
            <button
              type="button"
              className="btn"
              onClick={() => set('examples', [...draft.examples, { input: '', output: '', explanation: '' }])}
            >
              + Add example
            </button>
          </div>
        </div>

        <div className="tp-field">
          <label htmlFor="q-cons">Constraints</label>
          <textarea id="q-cons" className="mono" value={draft.constraints} onChange={(e) => set('constraints', e.target.value)} />
        </div>

        <div className="tp-field">
          <label className="tp-check">
            <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
            Add hidden test cases (optional; not needed for the visualization)
          </label>
          {showHidden && (
            <>
              {draft.hiddenTests.map((t, i) => (
                <div className="tp-example" key={i}>
                  <div className="tp-grid">
                    {(['input', 'output'] as const).map((k) => (
                      <div className="tp-field" key={k} style={{ marginBottom: 0 }}>
                        <label>
                          Hidden {k} {i + 1}
                        </label>
                        <textarea
                          className="mono"
                          value={t[k]}
                          onChange={(e) =>
                            set(
                              'hiddenTests',
                              draft.hiddenTests.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x))
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => set('hiddenTests', draft.hiddenTests.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div>
                <button
                  type="button"
                  className="btn"
                  onClick={() => set('hiddenTests', [...draft.hiddenTests, { input: '', output: '' }])}
                >
                  + Add hidden test
                </button>
              </div>
            </>
          )}
        </div>

        <div className="tp-field">
          <label htmlFor="q-notes">Notes for the VizuCode team (optional)</label>
          <textarea
            id="q-notes"
            style={{ minHeight: '3.5rem' }}
            placeholder="e.g. show the brute force too, focus on the two-pointer moves"
            value={draft.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </div>

        {error && (
          <p className="input-error" role="alert">
            {error}
          </p>
        )}
        {saved && <p className="tp-ok">{saved}</p>}
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send request'}
        </button>
      </form>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>My requests</h2>
        {requests === null ? (
          <p className="serif">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="serif">No requests yet.</p>
        ) : (
          <div className="tp-list">
            {requests.map((r) => (
              <div className="tp-item" key={r.id}>
                <div>
                  <div className="t">
                    #{r.id} {r.title}
                  </div>
                  <div className="sub">
                    {r.category} · sent {new Date(r.createdAt).toLocaleDateString()}
                    {r.adminNote ? ` · Team note: ${r.adminNote}` : ''}
                  </div>
                </div>
                <div className="tp-row">
                  <span className={`tp-pill ${r.difficulty}`}>{r.difficulty}</span>
                  <span className={`tp-pill ${r.status}`}>{r.status}</span>
                  {r.status === 'published' && (
                    <a className="btn" href={`#/visualize/${r.slug}`}>
                      Open
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
