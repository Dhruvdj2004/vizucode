// AI mock interview — setup. Upload a resume, pick a role, and the AI writes
// interview questions from the student's own projects and skills.
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LEVELS,
  ROLES,
  fetchInterviewHome,
  startInterview,
  toBase64,
  InterviewError,
  buyInterview,
  type InterviewHome as HomeData,
  type Lang,
} from '../../lib/interview';
import VoicePicker from './VoicePicker';
import { Icon } from '../../components/Icon';

const MAX_BYTES = 3 * 1024 * 1024;

function fmtDate(t: number) {
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function InterviewHome() {
  const navigate = useNavigate();
  const [home, setHome] = useState<HomeData | null>(null);
  const [loadError, setLoadError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState<string>(ROLES[0]);
  const [level, setLevel] = useState<string>('Fresher');
  const [lang, setLang] = useState<Lang>('english');
  const [busy, setBusy] = useState<false | 'paying' | 'reading'>(false);
  const [forcePay, setForcePay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'AI Mock Interview — VizuCode';
    fetchInterviewHome()
      .then(setHome)
      .catch((e: Error) => setLoadError(e.message));
    return () => {
      document.title = 'VizuCode — LeetCode Visualizer';
    };
  }, []);

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please choose a PDF file.');
      return;
    }
    if (f.size > MAX_BYTES) {
      setError('That PDF is over 3 MB. Please export a smaller one.');
      return;
    }
    setFile(f);
  }

  async function start() {
    if (!file || !home) return;
    setError(null);
    try {
      if (home.left === 0 || forcePay) {
        // Pay first; the credit is kept even if writing the questions then fails.
        setBusy('paying');
        const q = await buyInterview(home.price);
        setHome((h) => (h ? { ...h, ...q } : h));
        setForcePay(false);
      }
      setBusy('reading');
      const iv = await startInterview({ resume: await toBase64(file), role, level, lang });
      navigate(`/interview/${iv.id}`);
    } catch (e) {
      if (!(e instanceof InterviewError && e.message === 'cancelled')) setError((e as Error).message);
      if (e instanceof InterviewError && e.pay) {
        // e.g. this resume already had its free interview on another account.
        setForcePay(true);
        fetchInterviewHome().then(setHome).catch(() => {});
      }
      setBusy(false);
    }
  }

  const mustPay = home?.left === 0 || forcePay;
  const plural = (n: number) => (n === 1 ? '' : 's');

  return (
    <main className="iv">
      <div className="viz-header">
        <div className="eyebrow">New · AI mock interview</div>
        <h1 className="page-title">Practice your interview, out loud</h1>
        <p className="serif desc">
          Upload your resume. The AI interviewer reads it, asks you {8} questions about <b>your</b> projects and skills,
          and you answer by speaking. You get a score and feedback on every answer.
        </p>
      </div>

      <div className="iv-steps">
        <div className="panel iv-step"><span className="iv-step-n">1</span>Upload resume</div>
        <div className="panel iv-step"><span className="iv-step-n">2</span>AI asks by voice</div>
        <div className="panel iv-step"><span className="iv-step-n">3</span>You answer by voice</div>
        <div className="panel iv-step"><span className="iv-step-n">4</span>Score + feedback</div>
      </div>

      {loadError ? (
        <div className="panel serif">{loadError}</div>
      ) : (
        <div className="panel iv-setup">
          {home && !home.aiReady && (
            <p className="iv-alert">The AI interviewer isn’t configured on this server yet (missing GEMINI_API_KEY).</p>
          )}

          <label className="iv-label">Your resume (PDF, max 3 MB)</label>
          <div
            className={`iv-drop ${file ? 'has-file' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => fileInput.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              pick(e.dataTransfer.files[0]);
            }}
          >
            {file ? (
              <>
                <b><Icon name="file" /> {file.name}</b>
                <span className="faint">{(file.size / 1024).toFixed(0)} KB · click to change</span>
              </>
            ) : (
              <>
                <b>Drop your resume here</b>
                <span className="faint">or click to choose a PDF</span>
              </>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="application/pdf,.pdf"
              hidden
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </div>

          <div className="iv-fields">
            <div>
              <label className="iv-label" htmlFor="iv-role">Role</label>
              <select id="iv-role" className="iv-select" value={role} onChange={(e) => setRole(e.target.value)}>
                {ROLES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="iv-label" htmlFor="iv-level">Experience</label>
              <select id="iv-level" className="iv-select" value={level} onChange={(e) => setLevel(e.target.value)}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="iv-label" htmlFor="iv-lang">I will answer in</label>
              <select id="iv-lang" className="iv-select" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
                <option value="english">English</option>
                <option value="hinglish">English / Hindi / Hinglish</option>
              </select>
            </div>
          </div>

          <VoicePicker />

          {error && <p className="iv-alert">{error}</p>}

          <div className="iv-start-row">
            <button
              className="btn primary"
              disabled={!file || !!busy || !home?.aiReady || (mustPay && !home?.paymentsReady)}
              onClick={start}
            >
              {busy === 'paying'
                ? 'Waiting for payment…'
                : busy === 'reading'
                  ? 'Reading your resume…'
                  : mustPay
                    ? `Pay ₹${home!.price} & start interview →`
                    : 'Start interview →'}
            </button>
            {home && (
              <span className="faint iv-quota">
                {home.left > 0 ? (
                  home.paid > 0 && home.used >= home.included ? (
                    `${home.left} paid interview${plural(home.left)} left`
                  ) : (
                    `${home.left} free interview${plural(home.left)} left`
                  )
                ) : (
                  <>
                    Your {home.included} free interviews are used · ₹{home.price} per interview
                    {!home.proPlan && (
                      <>
                        {' '}· or <Link to="/upgrade">get Pro</Link> for {home.proIncluded} more
                      </>
                    )}
                  </>
                )}
              </span>
            )}
          </div>
          {busy === 'reading' && <p className="faint iv-small">This takes about 15–30 seconds.</p>}

          <p className="faint iv-small iv-privacy">
            <Icon name="lock" /> Your resume is only used to write the questions. We don’t store the PDF — only a short summary of your
            skills and projects, with no phone number or email. You’ll need a microphone; Chrome or Edge work best.
          </p>
        </div>
      )}

      {home && home.interviews.length > 0 && (
        <>
          <h2 className="apt-h2">Your interviews</h2>
          <div className="iv-history">
            {home.interviews.map((iv) => (
              <Link key={iv.id} to={`/interview/${iv.id}`} className="panel iv-history-row">
                <div>
                  <b>{iv.role}</b>
                  <div className="faint iv-small">
                    {iv.round > 1 ? `Round ${iv.round} · ` : ''}{iv.level} · {fmtDate(iv.createdAt)} · {iv.answered}/{iv.total} answered
                  </div>
                </div>
                <span className="iv-history-score mono">
                  {iv.overall === null ? 'Continue →' : `${iv.overall}/10`}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
