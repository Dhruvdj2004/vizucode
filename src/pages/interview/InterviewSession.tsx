// AI mock interview — the live session and the final report.
// Per question: the browser speaks it → the student records an answer (or
// types one) → the server transcribes + grades it → feedback → next.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  CATEGORY_LABEL,
  answerByAudio,
  answerByText,
  canRecord,
  canSpeak,
  fetchInterview,
  finishInterview,
  isSpeaking,
  onSpeakingChange,
  speak,
  startRecording,
  stopSpeaking,
  toBase64,
  type Feedback,
  type Interview,
  type Recording,
} from '../../lib/interview';
import VoicePicker from './VoicePicker';
import InterviewerBot, { type BotMood } from './InterviewerBot';
import { Icon } from '../../components/Icon';

const MAX_ANSWER_SEC = 180;
const MAX_TRIES = 2;

type Phase = 'intro' | 'speaking' | 'ready' | 'recording' | 'grading' | 'feedback';

function scoreTone(s: number) {
  return s >= 7 ? 'good' : s >= 4 ? 'mid' : 'bad';
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function InterviewSession() {
  const { id = '' } = useParams();
  const [iv, setIv] = useState<Interview | null>(null);
  const [loadError, setLoadError] = useState('');
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [voiceOn, setVoiceOn] = useState(canSpeak());
  const [typing, setTyping] = useState(!canRecord());
  const [typed, setTyped] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const [finishing, setFinishing] = useState(false);
  const rec = useRef<Recording | null>(null);
  const [talking, setTalking] = useState(isSpeaking);
  useEffect(() => onSpeakingChange(setTalking), []);
  const micLevel = useCallback(() => rec.current?.level() ?? 0, []);

  useEffect(() => {
    document.title = 'AI Mock Interview — VizuCode';
    fetchInterview(id)
      .then((data) => {
        setIv(data);
        const next = data.answers.findIndex((a) => !a);
        setIndex(next === -1 ? data.questions.length - 1 : next);
        if (next === -1) setPhase('feedback');
      })
      .catch((e: Error) => setLoadError(e.message));
    return () => {
      stopSpeaking();
      rec.current?.cancel();
      document.title = 'VizuCode — LeetCode Visualizer';
    };
  }, [id]);

  const ask = useCallback(
    async (i: number, data: Interview | null = iv) => {
      if (!data) return;
      setError('');
      setTyped('');
      if (voiceOn) {
        setPhase('speaking');
        await speak(data.questions[i].text);
        // The student may have started answering mid-question — don't undo that.
        setPhase((p) => (p === 'speaking' ? 'ready' : p));
      } else {
        setPhase('ready');
      }
    },
    [iv, voiceOn]
  );

  // Recording timer + auto-submit at the limit.
  useEffect(() => {
    if (phase !== 'recording') return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (phase === 'recording' && seconds >= MAX_ANSWER_SEC) void stopAndSubmit();
  }, [seconds, phase]);

  async function beginRecording() {
    setError('');
    stopSpeaking();
    try {
      rec.current = await startRecording();
      setSeconds(0);
      setPhase('recording');
    } catch {
      setError('Microphone access was blocked. Allow the mic in your browser’s address bar, or type your answer instead.');
      setTyping(true);
      setPhase('ready');
    }
  }

  async function submit(send: () => Promise<Interview>) {
    setPhase('grading');
    try {
      setIv(await send());
      setPhase('feedback');
    } catch (e) {
      setError((e as Error).message);
      setPhase('ready');
    }
  }

  async function stopAndSubmit() {
    const r = rec.current;
    if (!r) return;
    rec.current = null;
    const blob = await r.stop();
    if (blob.size < 2000) {
      setError('We couldn’t hear anything. Check your mic and try again.');
      setPhase('ready');
      return;
    }
    const audio = await toBase64(blob);
    await submit(() => answerByAudio(id, index, audio, blob.type || 'audio/webm'));
  }

  function cancelRecording() {
    rec.current?.cancel();
    rec.current = null;
    setPhase('ready');
  }

  async function finish() {
    stopSpeaking();
    rec.current?.cancel();
    setFinishing(true);
    try {
      setIv(await finishInterview(id));
    } catch (e) {
      setError((e as Error).message);
    }
    setFinishing(false);
  }

  if (loadError) {
    return (
      <main className="iv">
        <Link to="/interview" className="apt-back">← AI Interview</Link>
        <div className="panel serif">{loadError}</div>
      </main>
    );
  }
  if (!iv) return <div className="page-loading">Loading…</div>;
  if (iv.report) return <ReportView iv={iv} />;

  const q = iv.questions[index];
  const fb = iv.answers[index];
  const mood: BotMood =
    phase === 'recording'
      ? 'listening'
      : phase === 'grading'
        ? 'thinking'
        : talking
          ? 'speaking'
          : phase === 'feedback' && fb
            ? fb.score >= 7
              ? 'happy'
              : fb.score < 4
                ? 'concerned'
                : 'idle'
            : 'idle';
  const isLast = index === iv.questions.length - 1;
  const answeredCount = iv.answers.filter(Boolean).length;

  return (
    <main className="iv">
      <Link to="/interview" className="apt-back">← AI Interview</Link>

      <div className="iv-topbar">
        <div>
          <div className="eyebrow">{iv.role} · {iv.level}{iv.round > 1 ? ` · round ${iv.round}` : ''}</div>
          <div className="iv-dots" aria-label={`Question ${index + 1} of ${iv.questions.length}`}>
            {iv.questions.map((_, i) => (
              <span
                key={i}
                className={`iv-dot ${i === index ? 'on' : ''} ${iv.answers[i] ? `done ${scoreTone(iv.answers[i]!.score)}` : ''}`}
              />
            ))}
          </div>
        </div>
        <div className="iv-topbar-actions">
          {voiceOn && <VoicePicker compact />}
          {canSpeak() && (
            <button
              className="btn"
              onClick={() => {
                if (voiceOn) stopSpeaking();
                setVoiceOn(!voiceOn);
              }}
              aria-pressed={voiceOn}
            >
              <Icon name={voiceOn ? 'volume' : 'volume-off'} /> {voiceOn ? 'Voice on' : 'Voice off'}
            </button>
          )}
          <button className="btn" onClick={finish} disabled={finishing || phase === 'grading' || phase === 'recording'}>
            {finishing ? 'Building report…' : answeredCount === iv.questions.length ? 'See report' : 'End interview'}
          </button>
        </div>
      </div>

      {phase === 'intro' ? (
        <div className="panel iv-card iv-intro">
          <div className="iv-bot-tile">
            <InterviewerBot mood={talking ? 'speaking' : 'idle'} />
            <div className="iv-bot-name">Vizu · AI Interviewer</div>
          </div>
          <h2>{iv.round > 1 ? `Welcome back. This is round ${iv.round}.` : 'Hi, I’m Vizu. Ready when you are.'}</h2>
          {iv.round > 1 && (
            <p className="serif iv-round-note">
              I remember your last {iv.round === 2 ? 'interview' : `${iv.round - 1} interviews`}, so there are no repeat
              questions.{' '}
              {iv.questions.some((q) => q.category === 'followup')
                ? 'We’ll start by revisiting the answers you found hardest, then move to new ground.'
                : 'We’ll go deeper into parts of your resume we haven’t covered yet.'}
            </p>
          )}
          <p className="serif">
            I’ll ask you {iv.questions.length} questions based on your resume{voiceOn ? ', out loud' : ''}. Answer each one
            the way you would in a real interview — take a breath, structure your thoughts, and speak clearly. Up to 3
            minutes per answer.
          </p>
          <button className="btn primary" onClick={() => ask(index)}>
            {answeredCount ? `Continue from question ${index + 1} →` : 'Begin interview →'}
          </button>
        </div>
      ) : (
        <div className="panel iv-card">
          <div className="iv-stage">
            <div className="iv-bot-tile">
              <InterviewerBot mood={mood} level={micLevel} />
              <div className="iv-bot-name">Vizu · AI Interviewer</div>
            </div>
            <div className="iv-bubble">
              <div className="iv-q-head">
                <span className="iv-chip">{CATEGORY_LABEL[q.category]}</span>
                <span className="faint iv-small">Question {index + 1} of {iv.questions.length}</span>
              </div>
              <p className="iv-q">{q.text}</p>
              {canSpeak() && phase !== 'recording' && phase !== 'grading' && (
                <button className="iv-linkbtn" onClick={() => void speak(q.text)}>
                  <Icon name="refresh" /> Repeat question
                </button>
              )}
            </div>
          </div>

          {(phase === 'speaking' || phase === 'ready') && (
            <div className="iv-answer">
              {phase === 'speaking' && <p className="faint iv-small">Listening to the question… you can start any time.</p>}
              {typing ? (
                <>
                  <textarea
                    className="iv-textarea"
                    rows={6}
                    placeholder="Type your answer…"
                    value={typed}
                    maxLength={4000}
                    onChange={(e) => setTyped(e.target.value)}
                  />
                  <div className="iv-row">
                    <button
                      className="btn primary"
                      disabled={!typed.trim()}
                      onClick={() => submit(() => answerByText(id, index, typed.trim()))}
                    >
                      Submit answer
                    </button>
                    {canRecord() && <button className="iv-linkbtn" onClick={() => setTyping(false)}><Icon name="mic" /> Answer by voice instead</button>}
                  </div>
                </>
              ) : (
                <div className="iv-row">
                  <button className="btn primary iv-mic" onClick={beginRecording}><Icon name="mic" /> Start answering</button>
                  <button className="iv-linkbtn" onClick={() => setTyping(true)}><Icon name="keyboard" /> Type instead</button>
                </div>
              )}
            </div>
          )}

          {phase === 'recording' && (
            <div className="iv-answer iv-recording">
              <div className="iv-rec-status">
                <span className="iv-rec-dot" aria-hidden /> Recording · <span className="mono">{mmss(seconds)}</span>
                <span className="faint"> / {mmss(MAX_ANSWER_SEC)}</span>
              </div>
              <div className="iv-row">
                <button className="btn primary" onClick={stopAndSubmit}><Icon name="stop" /> Done — submit answer</button>
                <button className="iv-linkbtn" onClick={cancelRecording}>Cancel</button>
              </div>
            </div>
          )}

          {phase === 'grading' && <p className="iv-answer faint"><Icon name="hourglass" /> The interviewer is reviewing your answer…</p>}

          {error && <p className="iv-alert">{error}</p>}

          {phase === 'feedback' && fb && (
            <>
              <FeedbackBlock fb={fb} keyPoints={q.keyPoints} />
              <div className="iv-row iv-next">
                {fb.tries < MAX_TRIES && (
                  <button className="btn" onClick={() => ask(index)}><Icon name="undo" /> Try this question again</button>
                )}
                {isLast ? (
                  <button className="btn primary" onClick={finish} disabled={finishing}>
                    {finishing ? 'Building report…' : 'Finish & see report →'}
                  </button>
                ) : (
                  <button
                    className="btn primary"
                    onClick={() => {
                      setIndex(index + 1);
                      void ask(index + 1);
                    }}
                  >
                    Next question →
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}

function FeedbackBlock({ fb, keyPoints }: { fb: Feedback; keyPoints: string[] | null }) {
  return (
    <div className="iv-feedback">
      <div className="iv-fb-head">
        <span className={`iv-score ${scoreTone(fb.score)}`}>
          <b className="mono">{fb.score}</b>/10
        </span>
        {fb.tries > 1 && <span className="faint iv-small">Attempt {fb.tries}</span>}
      </div>
      <div className="iv-fb-section">
        <h3 className="apt-h3">What you said</h3>
        <p className="serif iv-transcript">{fb.transcript || <i className="faint">(nothing clear was heard)</i>}</p>
      </div>
      <div className="iv-fb-grid">
        {fb.strengths.length > 0 && (
          <div className="iv-fb-section">
            <h3 className="apt-h3 iv-good"><Icon name="check-circle" /> Good</h3>
            <ul>{fb.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
        {fb.missed.length > 0 && (
          <div className="iv-fb-section">
            <h3 className="apt-h3 iv-missed"><Icon name="bulb" /> Missed</h3>
            <ul>{fb.missed.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>
        )}
      </div>
      {keyPoints && (
        <div className="iv-fb-section">
          <h3 className="apt-h3">A strong answer covers</h3>
          <ul>{keyPoints.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      <div className="iv-fb-section iv-better">
        <h3 className="apt-h3">Sample answer</h3>
        <p className="serif">{fb.betterAnswer}</p>
        {canSpeak() && (
          <button className="iv-linkbtn" onClick={() => speak(fb.betterAnswer)}><Icon name="volume" /> Hear it</button>
        )}
      </div>
    </div>
  );
}

function ReportView({ iv }: { iv: Interview }) {
  const r = iv.report!;
  const [open, setOpen] = useState<number | null>(null);
  return (
    <main className="iv">
      <Link to="/interview" className="apt-back">← AI Interview</Link>
      <div className="viz-header">
        <div className="eyebrow">Interview report · {iv.role} · {iv.level}{iv.round > 1 ? ` · round ${iv.round}` : ''}</div>
        <h1 className="page-title">Your result</h1>
      </div>

      <div className="panel iv-report-top">
        <div className={`iv-big-score ${scoreTone(r.overall)}`}>
          <b className="mono">{r.overall}</b>
          <span>/10</span>
        </div>
        <p className="serif">{r.verdict}</p>
      </div>

      {(r.strengths.length > 0 || r.improve.length > 0) && (
        <div className="iv-fb-grid iv-report-lists">
          {r.strengths.length > 0 && (
            <div className="panel">
              <h3 className="apt-h3 iv-good"><Icon name="check-circle" /> You do well at</h3>
              <ul>{r.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}
          {r.improve.length > 0 && (
            <div className="panel">
              <h3 className="apt-h3 iv-missed"><Icon name="target" /> Work on next</h3>
              <ul>{r.improve.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      <h2 className="apt-h2">Question by question</h2>
      <div className="iv-history">
        {iv.questions.map((q, i) => {
          const a = iv.answers[i];
          return (
            <div key={i} className="panel iv-report-q">
              <button className="iv-report-q-head" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                <span className="iv-chip">{CATEGORY_LABEL[q.category]}</span>
                <span className="iv-report-q-text">{q.text}</span>
                <span className={`iv-score small ${a ? scoreTone(a.score) : ''}`}>
                  {a ? <><b className="mono">{a.score}</b>/10</> : 'Skipped'}
                </span>
              </button>
              {open === i && a && <FeedbackBlock fb={a} keyPoints={q.keyPoints} />}
            </div>
          );
        })}
      </div>

      <div className="iv-row iv-next">
        <Link to="/interview" className="btn primary">Start another interview →</Link>
      </div>
    </main>
  );
}
