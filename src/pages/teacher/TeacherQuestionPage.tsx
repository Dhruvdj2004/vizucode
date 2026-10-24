import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  getTeacherSession,
  MATCH_LABEL,
  statusClass,
  statusLabel,
  teacherApi,
  type RequestFull,
  type TeacherInfo,
} from '../../lib/teacher';
import { compileVisualizer, type CompileResult } from '../../lib/compileVisualizer';
import { toStatic } from '../../lib/serialize';
import VisualizerPage from '../VisualizerPage';

/** One question, start to finish: check duplicates, generate with Gemini, preview, edit, publish. */
export default function TeacherQuestionPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const session = getTeacherSession();
  const [info, setInfo] = useState<TeacherInfo | null>(null);
  const [req, setReq] = useState<RequestFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [sample, setSample] = useState(0);
  const [code, setCode] = useState('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [check, setCheck] = useState<CompileResult | null>(null);
  const [typeErrors, setTypeErrors] = useState<string[]>([]);

  const load = useCallback(() => {
    teacherApi
      .get(id)
      .then(({ request }) => {
        setReq(request);
        setTypeErrors(request.typeErrors ?? []);
        setCode(request.generatedCode ?? '');
        setDirty(false);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!session) return;
    load();
    teacherApi.me().then(setInfo).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const expected = req?.examples[sample]?.output ?? req?.examples[0]?.output;

  const runCheck = useCallback(
    async (src: string) => {
      if (!req || !src.trim()) {
        setCheck(null);
        return;
      }
      setCheck(await compileVisualizer(src, req.slug, expected));
    },
    [req, expected]
  );

  // Re-check whenever new code arrives from the server (not on every keystroke).
  useEffect(() => {
    if (!dirty) runCheck(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req?.generatedCode]);

  if (!session) return <Navigate to="/teacher/login" replace />;

  async function act(label: string, fn: () => Promise<unknown>) {
    setError(null);
    setBusy(label);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed.');
    } finally {
      setBusy(null);
    }
  }

  if (error && !req) return <div className="panel input-error">{error}</div>;
  if (!req) return <div className="panel serif">Loading…</div>;

  const isPublished = req.status === 'published';
  const exactOnSite = req.siteMatches.some((m) => m.kind === 'exact' && m.hasVisualizer);
  const canPublish =
    !isPublished && !exactOnSite && !!check?.def && check.errors.length === 0 && typeErrors.length === 0 && !dirty;

  return (
    <div className="tp-wrap">
      <div className="tp-head">
        <div>
          <div className="eyebrow">
            <Link to="/teacher">My questions</Link> / #{req.id}
          </div>
          <h1 className="page-title">{req.title}</h1>
          <div className="tp-row">
            <span className={`tp-pill ${statusClass(req.status)}`}>{statusLabel(req.status)}</span>
            <span className={`tp-pill ${req.difficulty}`}>{req.difficulty}</span>
            <span className="tp-pill">{req.category}</span>
            <span className="tp-pill">slug: {req.slug}</span>
          </div>
        </div>
        {!isPublished && (
          <button
            className="btn"
            disabled={!!busy}
            onClick={() =>
              act('delete', async () => {
                if (!window.confirm(`Delete "${req.title}"? This can't be undone.`)) return;
                await teacherApi.remove(req.id);
                navigate('/teacher');
              })
            }
          >
            Delete
          </button>
        )}
      </div>

      {error && <p className="input-error">{error}</p>}
      {req.adminNote && req.status === 'pending' && <p className="input-error">{req.adminNote}</p>}

      {req.status === 'in_review' && req.review && (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>In review</h2>
          <p className="serif">
            Sent to the VizuCode team as{' '}
            <a href={req.review.url} target="_blank" rel="noreferrer">
              pull request #{req.review.number}
            </a>
            . It goes live once they merge it. You can still regenerate or edit below and click <b>Update the review</b>.
          </p>
        </div>
      )}

      {req.siteMatches.length > 0 && !isPublished && (
        <div className="panel tp-dup">
          <h2 style={{ marginTop: 0 }}>Already on VizuCode?</h2>
          <p className="serif">
            {exactOnSite
              ? 'This exact question already has a visualizer on the site, so it cannot be published again.'
              : 'This looks like a question the site already lists. Check it before generating.'}
          </p>
          <div className="tp-list">
            {req.siteMatches.map((m) => (
              <div className="tp-item" key={m.slug}>
                <div>
                  <div className="t">{m.title}</div>
                  <div className="sub">
                    {MATCH_LABEL[m.kind]} · {m.category} ·{' '}
                    {m.hasVisualizer ? 'already has a visualizer' : 'listed, but no visualizer yet'}
                  </div>
                </div>
                {m.hasVisualizer ? (
                  <a className="btn" href={`#/visualize/${m.slug}`} target="_blank" rel="noreferrer">
                    Open visualizer
                  </a>
                ) : (
                  <span className="tp-pill pending">no visualizer</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel">
        <p className="tp-hint">
          Added {new Date(req.createdAt).toLocaleString()}
          {req.sourceUrl && (
            <>
              {' '}
              ·{' '}
              <a href={req.sourceUrl} target="_blank" rel="noreferrer">
                source
              </a>
            </>
          )}
        </p>
        <pre className="tp-pre">{req.description}</pre>
        <h3>Examples</h3>
        {req.examples.map((e, i) => (
          <div className="tp-example" key={i}>
            <pre className="tp-pre mono">
              <b>Input:</b> {e.input}
              {'\n'}
              <b>Output:</b> {e.output}
              {e.explanation ? `\nExplanation: ${e.explanation}` : ''}
            </pre>
          </div>
        ))}
        {req.constraints && (
          <>
            <h3>Constraints</h3>
            <pre className="tp-pre mono">{req.constraints}</pre>
          </>
        )}
        {req.hiddenTests.length > 0 && <p className="tp-hint">{req.hiddenTests.length} hidden test case(s) attached.</p>}
        {req.notes && (
          <p>
            <b>Notes:</b> {req.notes}
          </p>
        )}
      </div>

      {!isPublished && (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>1. Generate the visualizer</h2>
          {info && !info.ai && <p className="input-error">The server has no GEMINI_API_KEY, so generating is off.</p>}
          <div className="tp-grid">
            <div className="tp-field">
              <label>Sample test case to build it from</label>
              <select value={sample} onChange={(e) => setSample(Number(e.target.value))}>
                {req.examples.map((e, i) => (
                  <option key={i} value={i}>
                    Example {i + 1}: {e.input.slice(0, 60)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="tp-field">
            <label>Extra instructions (optional; use them to fix things when you regenerate)</label>
            <textarea
              style={{ minHeight: '4rem' }}
              placeholder="e.g. use the array widget with l/r pointers, show the brute force too, keep it under 30 steps"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <button
            className="btn primary"
            disabled={!!busy || (info !== null && !info.ai)}
            onClick={() =>
              act('generate', async () => {
                const r = await teacherApi.generate(req.id, prompt, sample);
                setTypeErrors(r.typeErrors);
                setCode(r.code);
                setDirty(false);
                await runCheck(r.code);
                load();
              })
            }
          >
            {busy === 'generate' ? 'Gemini is writing it… (up to a few minutes)' : code ? 'Regenerate' : 'Generate'}
          </button>
          {!!req.generations?.length && (
            <p className="tp-hint">
              {req.generations.length} generation(s) so far · last{' '}
              {new Date(req.generations[req.generations.length - 1].at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {code && (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>2. Check the code</h2>
          <textarea
            className="tp-code"
            spellCheck={false}
            value={code}
            readOnly={isPublished}
            onChange={(e) => {
              setCode(e.target.value);
              setDirty(true);
            }}
          />
          {!isPublished && (
            <div className="tp-row" style={{ marginTop: '0.6rem' }}>
              <button
                className="btn"
                disabled={!dirty || !!busy}
                onClick={() =>
                  act('save', async () => {
                    const r = await teacherApi.saveCode(req.id, code);
                    setTypeErrors(r.typeErrors);
                    setDirty(false);
                    await runCheck(code);
                  })
                }
              >
                Save edits & re-check
              </button>
              {dirty && <span className="tp-hint">Unsaved edits; the preview shows the last saved version.</span>}
            </div>
          )}
          {check && (
            <div className="tp-msgs">
              {typeErrors.map((m) => (
                <div className="err" key={'ts' + m}>
                  ✗ TypeScript {m}
                </div>
              ))}
              {check.errors.map((m) => (
                <div className="err" key={m}>
                  ✗ {m}
                </div>
              ))}
              {check.warnings.map((m) => (
                <div className="warn" key={m}>
                  ! {m}
                </div>
              ))}
              {check.def && check.errors.length === 0 && typeErrors.length === 0 && (
                <div className="tp-ok">
                  ✓ Type-checks, runs: {check.steps} steps, result {check.result}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {check?.def && check.errors.length === 0 && (
        <div className="tp-preview">
          <div className="eyebrow faint" style={{ marginBottom: '0.8rem' }}>
            3. Live preview {isPublished ? '' : '(not published yet)'}
          </div>
          <VisualizerPage previewDef={check.def} />
        </div>
      )}

      {!isPublished && code && (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>4. Send for review</h2>
          <p className="serif">
            Sends this question and its visualizer to the VizuCode team as a pull request
            {info ? ` to ${info.github.repo} (${info.github.branch})` : ''}. It goes live on the site once they merge it.
          </p>
          <button
            className="btn primary"
            disabled={!canPublish || !!busy}
            onClick={() =>
              act('publish', async () => {
                const again = req.status === 'in_review';
                if (!window.confirm(again ? `Update the review of "${req.title}" with this version?` : `Send "${req.title}" for review?`))
                  return;
                await teacherApi.publish(req.id, toStatic(check!.def!));
                load();
              })
            }
          >
            {busy === 'publish' ? 'Sending…' : req.status === 'in_review' ? 'Update the review' : 'Send for review'}
          </button>
          {!canPublish && (
            <p className="tp-hint">
              {exactOnSite
                ? 'Blocked: this question is already on the site.'
                : typeErrors.length
                  ? 'Blocked: fix the TypeScript errors above (Regenerate usually does it), or the site build would break.'
                  : 'Unlocks once the code is saved and passes every check above.'}
            </p>
          )}
        </div>
      )}

      {isPublished && (
        <div className="panel">
          <p className="tp-ok">
            Published: the review was merged
            {req.review ? (
              <>
                {' '}
                (
                <a href={req.review.url} target="_blank" rel="noreferrer">
                  #{req.review.number}
                </a>
                )
              </>
            ) : null}
            . · <a href={`#/visualize/${req.slug}`}>Open on the site</a> (live after the deploy finishes)
          </p>
        </div>
      )}
    </div>
  );
}
