// Resume editor: upload a resume, ask for changes in plain English, download
// the PDF or LaTeX. An uploaded .tex is kept exactly as it is — the AI only
// patches the lines a request is about, so everything else downloads unchanged.
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../lib/auth';
import {
  RESUME_READY,
  editResume,
  fetchFile,
  listVersions,
  revertResume,
  saveBlob,
  uploadResume,
  type ResumeVersion,
} from '../lib/resume';

interface ChatLine {
  from: 'user' | 'bot';
  text: string;
  kind?: 'ok' | 'warn' | 'err';
  version?: number;
}

const REBUILT_NOTE =
  'A PDF or DOCX has no LaTeX inside, so it was rebuilt in our template and looks different from your original. ' +
  'To keep your exact design, click "New resume" and upload your .tex file (in Overleaf: Menu → Download → Source).';

const COPIED_NOTE =
  'Your PDF was turned into LaTeX that copies its layout, fonts and colours line by line. Photos are left out. ' +
  'Compare it with your original. For a 100% exact copy, click "New resume" and upload your .tex file instead.';

const MATCHED_NOTE =
  "A PDF has no LaTeX inside, so it was rebuilt to match your PDF's font, sizes, margins and headings. " +
  'Small details can still differ. For an exact copy, click "New resume" and upload your .tex file (in Overleaf: Menu → Download → Source).';

const ACCEPT = '.tex,.pdf,.docx,.txt';
const SUGGESTIONS = [
  'Fix any typos and grammar mistakes',
  'Make my project bullets sound stronger',
  'Add Docker to my skills',
];

function storageKey(): string {
  return `vizucode-resume:${getSession()?.user.id ?? 'anon'}`;
}

function readSid(): string | null {
  try {
    return localStorage.getItem(storageKey());
  } catch {
    return null;
  }
}

function writeSid(sid: string | null) {
  try {
    if (sid) localStorage.setItem(storageKey(), sid);
    else localStorage.removeItem(storageKey());
  } catch {
    /* private mode — the session just won't survive a reload */
  }
}

/** Rebuild the chat from the saved version history. */
function historyToChat(list: ResumeVersion[]): ChatLine[] {
  const lines: ChatLine[] = [];
  for (const v of list) {
    if (v.request) lines.push({ from: 'user', text: v.request });
    lines.push({ from: 'bot', text: v.summary || `Version ${v.version}`, kind: 'ok', version: v.version });
    if (v.version === 1 && v.summary?.startsWith('Rebuilt'))
      lines.push({
        from: 'bot',
        text: v.summary.includes('copying') ? COPIED_NOTE : v.summary.includes('matching') ? MATCHED_NOTE : REBUILT_NOTE,
        kind: 'warn',
      });
  }
  return lines;
}

/** #/resume: the editor once its service is deployed, "in progress" until then. */
export default function ResumePage() {
  return RESUME_READY ? <ResumeEditor /> : <ResumeComingSoon />;
}

function ResumeComingSoon() {
  useEffect(() => {
    document.title = 'Resume Editor — VizuCode';
    return () => {
      document.title = 'VizuCode — LeetCode Visualizer';
    };
  }, []);
  return (
    <main>
      <div className="viz-header">
        <div className="eyebrow">In progress</div>
        <h1 className="page-title">Resume Editor</h1>
        <p className="serif desc">
          Upload your resume, ask for changes in plain English, and download a clean PDF or LaTeX file. We’re putting
          the finishing touches on it.
        </p>
      </div>
      <div className="panel resume-soon">
        <span className="resume-soon-badge mono">coming soon</span>
        <ul className="resume-notes">
          <li>
            <b>Edit by chatting:</b> “make my project bullets stronger”, “add TypeScript to skills”.
          </li>
          <li>
            <b>Your layout stays yours:</b> a .tex file is kept exactly as it is; only the lines you ask about change.
          </li>
          <li>
            <b>Every version saved:</b> go back to any earlier version in one click.
          </li>
        </ul>
        <p className="faint resume-soon-foot">
          Meanwhile, practise talking about that resume:{' '}
          <Link to="/interview">try an AI mock interview →</Link>
        </p>
      </div>
    </main>
  );
}

function ResumeEditor() {
  const [sid, setSid] = useState<string | null>(readSid);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [viewing, setViewing] = useState<number | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const latest = versions.length ? versions[versions.length - 1].version : null;

  useEffect(() => {
    document.title = 'Resume Editor — VizuCode';
    return () => {
      document.title = 'VizuCode — LeetCode Visualizer';
    };
  }, []);

  // Load the saved session's history.
  useEffect(() => {
    if (!sid) return;
    let live = true;
    listVersions(sid)
      .then((list) => {
        if (!live) return;
        if (!list.length) throw new Error('empty');
        setVersions(list);
        setChat(historyToChat(list));
        setViewing(list[list.length - 1].version);
      })
      .catch(() => {
        if (!live) return;
        writeSid(null);
        setSid(null);
      });
    return () => {
      live = false;
    };
  }, [sid]);

  // Load the PDF for the version being viewed.
  useEffect(() => {
    if (!sid || viewing == null) return;
    let live = true;
    let url: string | null = null;
    fetchFile(sid, viewing, 'pdf')
      .then(({ blob }) => {
        if (!live) return;
        url = URL.createObjectURL(blob);
        setPdfUrl(url);
      })
      .catch((e: Error) => live && setError(e.message));
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [sid, viewing]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: 'end' });
  }, [chat, busy]);

  async function refresh(showVersion?: number) {
    if (!sid) return;
    const list = await listVersions(sid);
    setVersions(list);
    setViewing(showVersion ?? list[list.length - 1].version);
  }

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!/\.(tex|pdf|docx|txt)$/i.test(file.name)) return setError('Upload a .tex, PDF, DOCX or TXT file.');
    if (file.size > 5 * 1024 * 1024) return setError('That file is larger than 5 MB.');
    setUploading(file.name);
    try {
      const res = await uploadResume(file);
      writeSid(res.session_id);
      setPdfUrl(null);
      setSid(res.session_id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(null);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  async function send(message: string) {
    if (!sid || !message.trim() || busy) return;
    setChat((c) => [...c, { from: 'user', text: message }]);
    setInput('');
    setBusy(true);
    try {
      const res = await editResume(sid, message);
      if (res.status === 'ok') {
        setChat((c) => [...c, { from: 'bot', text: res.message, kind: 'ok', version: res.version }]);
        await refresh(res.version);
      } else {
        setChat((c) => [...c, { from: 'bot', text: res.message, kind: res.status === 'error' ? 'err' : 'warn' }]);
      }
    } catch (e) {
      setChat((c) => [...c, { from: 'bot', text: (e as Error).message, kind: 'err' }]);
    } finally {
      setBusy(false);
    }
  }

  async function download(kind: 'pdf' | 'tex') {
    if (!sid || viewing == null) return;
    try {
      const { blob, name } = await fetchFile(sid, viewing, kind);
      saveBlob(blob, name);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function revert() {
    if (!sid || viewing == null || viewing === latest) return;
    setBusy(true);
    try {
      const res = await revertResume(sid, viewing);
      setChat((c) => [...c, { from: 'bot', text: res.message, kind: 'ok', version: res.version }]);
      await refresh(res.version);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function startOver() {
    writeSid(null);
    setSid(null);
    setVersions([]);
    setChat([]);
    setViewing(null);
    setPdfUrl(null);
    setError(null);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  if (!sid) {
    return (
      <main>
        <div className="viz-header">
          <div className="eyebrow">AI · LaTeX</div>
          <h1 className="page-title">Resume Editor</h1>
          <p className="serif desc">
            Upload your resume, ask for changes in plain English, and download the PDF or LaTeX.
          </p>
        </div>

        <label
          className={`panel resume-drop ${uploading ? 'busy' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onUpload(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            hidden
            disabled={!!uploading}
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
          {uploading ? (
            <>
              <strong>Reading {uploading}…</strong>
              <span className="faint">A .tex file takes a few seconds. A PDF takes about 1–2 minutes, because its layout is copied line by line.</span>
            </>
          ) : (
            <>
              <strong>Drop your resume here, or click to choose a file</strong>
              <span className="faint">LaTeX (.tex), PDF, DOCX or TXT · up to 5 MB</span>
            </>
          )}
        </label>
        {error && <p className="resume-error">{error}</p>}

        <ul className="resume-notes">
          <li>
            <b>Got a .tex file?</b> Upload that. Your LaTeX is kept exactly as it is. Each edit only changes the lines
            you asked about, and the preamble (layout, fonts, macros) is never touched.
          </li>
          <li>
            <b>PDF or DOCX?</b> It is rebuilt in a clean LaTeX template first. After that, the same rule applies.
          </li>
        </ul>
      </main>
    );
  }

  return (
    <main className="resume-editor">
      <section className="panel resume-chat" aria-label="Edit by chat">
        <div className="resume-chat-head">
          <h1 className="resume-title">Resume Editor</h1>
          <button className="btn" onClick={startOver} disabled={busy}>
            New resume
          </button>
        </div>
        <div className="resume-messages">
          {chat.map((m, i) => (
            <div key={i} className={`resume-msg ${m.from} ${m.kind ?? ''}`}>
              {m.text}
              {m.version != null && <span className="resume-tag">v{m.version}</span>}
            </div>
          ))}
          {busy && <div className="resume-msg bot faint">Working on it…</div>}
          <div ref={chatEnd} />
        </div>
        {versions.length === 1 && !busy && (
          <div className="resume-suggest">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="news-day" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <form className="resume-input" onSubmit={onSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Add a bullet about my internship at …"
            maxLength={2000}
            disabled={busy}
            aria-label="Describe a change"
          />
          <button className="btn primary" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </section>

      <section className="panel resume-preview" aria-label="Preview">
        <div className="resume-toolbar">
          <select
            value={viewing ?? ''}
            onChange={(e) => setViewing(Number(e.target.value))}
            aria-label="Version"
          >
            {[...versions].reverse().map((v) => (
              <option key={v.version} value={v.version}>
                v{v.version}
                {v.version === latest ? ' (latest)' : ''} · {(v.summary ?? '').slice(0, 40)}
              </option>
            ))}
          </select>
          {viewing !== latest && (
            <button className="btn" onClick={revert} disabled={busy}>
              Restore this version
            </button>
          )}
          <span className="resume-spacer" />
          <button className="btn" onClick={() => download('tex')}>
            .tex
          </button>
          <button className="btn primary" onClick={() => download('pdf')}>
            Download PDF
          </button>
        </div>
        {error && <p className="resume-error">{error}</p>}
        {pdfUrl ? (
          <iframe className="resume-pdf" src={pdfUrl} title="Resume preview" />
        ) : (
          <div className="page-loading">Loading preview…</div>
        )}
      </section>
    </main>
  );
}
