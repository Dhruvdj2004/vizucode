import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi, type RequestFull } from '../../lib/teacher';
import { compileVisualizer, type CompileResult } from '../../lib/compileVisualizer';
import { toStatic } from '../../lib/serialize';
import VisualizerPage from '../VisualizerPage';

export default function AdminRequestPage() {
  const id = Number(useParams().id);
  const [req, setReq] = useState<RequestFull | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sample, setSample] = useState(0);
  const [code, setCode] = useState('');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [check, setCheck] = useState<CompileResult | null>(null);
  const [published, setPublished] = useState<{ url: string; branch: string } | null>(null);

  const load = useCallback(() => {
    adminApi
      .get(id)
      .then(({ request }) => {
        setReq(request);
        setNote(request.adminNote);
        setCode(request.generatedCode ?? '');
        setDirty(false);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(load, [load]);

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

  const canPublish = req.status === 'accepted' && !!check?.def && check.errors.length === 0 && !dirty;

  return (
    <div className="tp-wrap">
      <div className="tp-head">
        <div>
          <div className="eyebrow">
            <Link to="/admin">Requests</Link> / #{req.id}
          </div>
          <h1 className="page-title">{req.title}</h1>
          <div className="tp-row">
            <span className={`tp-pill ${req.status}`}>{req.status}</span>
            <span className={`tp-pill ${req.difficulty}`}>{req.difficulty}</span>
            <span className="tp-pill">{req.category}</span>
            <span className="tp-pill">slug: {req.slug}</span>
            {req.alreadyOnSite && <span className="tp-pill rejected">already on the site</span>}
          </div>
        </div>
      </div>

      {error && <p className="input-error">{error}</p>}

      <div className="panel">
        <p className="tp-hint">
          From {req.teacher ? `${req.teacher.name} (${req.teacher.email})` : 'a deleted teacher'} ·{' '}
          {new Date(req.createdAt).toLocaleString()}
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
            <b>Teacher's notes:</b> {req.notes}
          </p>
        )}
      </div>

      {req.status !== 'published' && (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Decision</h2>
          <div className="tp-field">
            <label>Note to the teacher (optional)</label>
            <input className="tp-input" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="tp-row">
            <button
              className="btn primary"
              disabled={!!busy || req.status === 'accepted'}
              onClick={() => act('accept', async () => {
                await adminApi.decide(req.id, 'accept', note);
                load();
              })}
            >
              {req.status === 'accepted' ? 'Accepted' : 'Accept'}
            </button>
            <button
              className="btn"
              disabled={!!busy || req.status === 'rejected'}
              onClick={() => act('reject', async () => {
                await adminApi.decide(req.id, 'reject', note);
                load();
              })}
            >
              {req.status === 'rejected' ? 'Rejected' : 'Reject'}
            </button>
          </div>
        </div>
      )}

      {req.status === 'accepted' && (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Generate the visualizer</h2>
          <div className="tp-grid">
            <div className="tp-field">
              <label>Sample test case sent to Gemini</label>
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
            <label>Extra instructions (optional; used when regenerating)</label>
            <textarea
              style={{ minHeight: '4rem' }}
              placeholder="e.g. use the array widget with l/r pointers, show the brute force, keep it under 30 steps"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <button
            className="btn primary"
            disabled={!!busy}
            onClick={() =>
              act('generate', async () => {
                const r = await adminApi.generate(req.id, prompt, sample);
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
              {req.generations.length} generation(s) so far · last {new Date(req.generations[req.generations.length - 1].at).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {code && (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Code</h2>
          <textarea
            className="tp-code"
            spellCheck={false}
            value={code}
            readOnly={req.status !== 'accepted'}
            onChange={(e) => {
              setCode(e.target.value);
              setDirty(true);
            }}
          />
          {req.status === 'accepted' && (
            <div className="tp-row" style={{ marginTop: '0.6rem' }}>
              <button
                className="btn"
                disabled={!dirty || !!busy}
                onClick={() =>
                  act('save', async () => {
                    await adminApi.saveCode(req.id, code);
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
              {check.def && check.errors.length === 0 && (
                <div className="tp-ok">
                  ✓ Compiles and runs: {check.steps} steps, result {check.result}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {check?.def && check.errors.length === 0 && (
        <div className="tp-preview">
          <div className="eyebrow faint" style={{ marginBottom: '0.8rem' }}>
            Live preview (not published)
          </div>
          <VisualizerPage previewDef={check.def} />
        </div>
      )}

      {req.status === 'accepted' && code && (
        <div className="panel">
          <h2 style={{ marginTop: 0 }}>Publish</h2>
          <p className="serif">
            Commits <code>src/problems/generated/{req.slug}.ts</code>, its registry line and its catalog entry to GitHub,
            and adds it to the database. Vercel then redeploys the site.
          </p>
          <button
            className="btn primary"
            disabled={!canPublish || !!busy}
            onClick={() =>
              act('publish', async () => {
                if (!window.confirm(`Publish "${req.title}" to GitHub now?`)) return;
                const r = await adminApi.publish(req.id, toStatic(check!.def!));
                setPublished({ url: r.url, branch: r.branch });
                load();
              })
            }
          >
            {busy === 'publish' ? 'Publishing…' : 'Publish to GitHub'}
          </button>
          {!canPublish && <p className="tp-hint">Publishing unlocks once the code is saved and passes every check.</p>}
        </div>
      )}

      {(published || req.publishedCommit) && (
        <div className="panel">
          <p className="tp-ok">
            Published{published ? ` to ${published.branch}` : ''}.{' '}
            {published ? (
              <a href={published.url} target="_blank" rel="noreferrer">
                View commit
              </a>
            ) : (
              <code>{req.publishedCommit}</code>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
