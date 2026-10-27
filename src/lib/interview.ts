// Client for the AI mock interview API (server/interview.ts) plus the two
// browser voice pieces: speaking a question (speechSynthesis) and recording
// an answer (MediaRecorder). Transcribing and grading happen on the server.
import { getSession } from './auth';

export { ROLES, LEVELS } from './interviewOptions';
export type Lang = 'english' | 'hinglish';
export type Category = 'intro' | 'followup' | 'project' | 'skill' | 'fundamentals' | 'hr';

export const CATEGORY_LABEL: Record<Category, string> = {
  intro: 'Introduction',
  followup: 'Follow-up',
  project: 'Project',
  skill: 'Skill',
  fundamentals: 'CS fundamentals',
  hr: 'HR',
};

export interface Feedback {
  transcript: string;
  score: number;
  strengths: string[];
  missed: string[];
  betterAnswer: string;
  tries: number;
  answeredAt: number;
}

export interface Report {
  overall: number;
  verdict: string;
  strengths: string[];
  improve: string[];
}

export interface Interview {
  id: string;
  role: string;
  level: string;
  lang: Lang;
  createdAt: number;
  /** 1 for a first interview; 2, 3… when it continues earlier ones. */
  round: number;
  questions: { text: string; category: Category; keyPoints: string[] | null }[];
  answers: (Feedback | null)[];
  report: Report | null;
}

export interface InterviewSummary {
  id: string;
  role: string;
  level: string;
  createdAt: number;
  round: number;
  answered: number;
  total: number;
  overall: number | null;
}

export interface InterviewQuota {
  /** Interviews the user can start right now. */
  left: number;
  /** Included with the account: 1, or 3 for Pro. */
  included: number;
  used: number;
  paid: number;
}

export interface InterviewHome extends InterviewQuota {
  interviews: InterviewSummary[];
  isPro: boolean;
  /** Rupees per extra interview. */
  price: number;
  /** Free interviews every account gets (on Groq). */
  freeIncluded: number;
  /** Extra interviews Pro adds. */
  proIncluded: number;
  /** Paid Pro (the college upgrade doesn't count for interviews). */
  proPlan: boolean;
  /** @ietdavv.edu.in account: 10 free interviews on Groq once verified, never offered Pro. */
  college?: boolean;
  aiReady: boolean;
  paymentsReady: boolean;
}

export class InterviewError extends Error {
  /** The user has no interviews left and needs to pay for one. */
  pay: boolean;
  constructor(message: string, pay = false) {
    super(message);
    this.pay = pay;
  }
}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const token = getSession()?.token;
  let res: Response;
  try {
    res = await fetch(`/api/interview${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        Authorization: `Bearer ${token ?? ''}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new InterviewError('Network error — check your connection and try again.');
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string; pay?: boolean };
  if (!res.ok) {
    if (res.status === 413) throw new InterviewError('That file is too large. Please keep it under 3 MB.');
    throw new InterviewError(data.error ?? `Something went wrong (${res.status}).`, !!data.pay);
  }
  return data;
}

export const fetchInterviewHome = () => call<InterviewHome>('');
export const fetchInterview = (id: string) => call<Interview>(`/${encodeURIComponent(id)}`);
export const startInterview = (input: { resume: string; role: string; level: string; lang: Lang }) =>
  call<Interview>('', input);
export const answerByAudio = (id: string, index: number, audio: string, mime: string) =>
  call<Interview>(`/${encodeURIComponent(id)}/answer`, { index, audio, mime });
export const answerByText = (id: string, index: number, text: string) =>
  call<Interview>(`/${encodeURIComponent(id)}/answer`, { index, text });
export const finishInterview = (id: string) => call<Interview>(`/${encodeURIComponent(id)}/finish`, {});

// ---------- paying for an interview (₹19) ----------

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

/**
 * Opens Razorpay for one interview. Resolves with the new quota once the
 * payment is verified; rejects if it fails, or with `cancelled` if closed.
 */
export async function buyInterview(price: number): Promise<InterviewQuota> {
  const session = getSession();
  if (!RAZORPAY_KEY_ID) throw new InterviewError('Payments are not configured (missing VITE_RAZORPAY_KEY_ID).');
  const { loadRazorpayScript } = await import('./razorpay');
  await loadRazorpayScript();
  const order = await call<{ orderId: string; amount: number; currency: string }>('/pay/order', {});
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'VizuCode',
      description: `AI mock interview · ₹${price}`,
      prefill: session ? { name: session.user.firstName, email: session.user.email } : undefined,
      theme: { color: '#b96f27' },
      handler: (response) => {
        call<InterviewQuota>('/pay/verify', response).then(resolve, reject);
      },
      modal: { ondismiss: () => reject(new InterviewError('cancelled')) },
    });
    rzp.on('payment.failed', (r) => reject(new InterviewError(r.error?.description ?? 'Payment failed. Please try again.')));
    rzp.open();
  });
}

/** File/Blob → bare base64 (no "data:...;base64," prefix). */
export function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// ---------- speaking ----------

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

// The site speaks with voices built into the student's browser/OS, so what's
// available differs per device (Chrome: Google UK/US; Mac: Rishi, Veena;
// Edge on Windows: Neerja, Prabhat "Natural"). We offer a few fixed choices and
// show only the ones this device can actually play.

export type VoiceId = 'in-female' | 'in-male' | 'intl-female' | 'intl-male';
export type Speed = 'slow' | 'normal' | 'fast';

interface VoicePreset {
  id: VoiceId;
  label: string;
  /** Best match first. */
  match: (v: SpeechSynthesisVoice) => number;
}

const NATURAL = /natural|neural|online|google|premium|enhanced/i;
const IN_FEMALE = /neerja|veena|lekha|heera|kajal|swara|aditi|isha|female/i;
const IN_MALE = /prabhat|rishi|ravi|hemant|madhur|male/i;
const INTL_FEMALE = /uk english female|us english|samantha|aria|jenny|sonia|libby|zira|karen|moira|tessa|serena|kate|female/i;
const INTL_MALE = /uk english male|daniel|guy|ryan|davis|david|mark|arthur|alex|fred|oliver|male/i;

/** Score a voice: 0 = no match; higher = better (a natural-sounding voice wins ties). */
const scorer =
  (lang: (l: string) => boolean, name: RegExp, notName?: RegExp) =>
  (v: SpeechSynthesisVoice) => {
    if (!lang(v.lang.replace('_', '-')) || !name.test(v.name)) return 0;
    if (notName?.test(v.name)) return 0;
    return 1 + (NATURAL.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);
  };
const isIN = (l: string) => /^(en|hi)-IN$/i.test(l);
const isIntl = (l: string) => /^en-(GB|US|AU|IE|CA)$/i.test(l);

export const VOICE_PRESETS: VoicePreset[] = [
  { id: 'in-female', label: 'Indian English · Female', match: scorer(isIN, IN_FEMALE, /\bmale\b/i) },
  { id: 'in-male', label: 'Indian English · Male', match: scorer(isIN, IN_MALE, /female/i) },
  { id: 'intl-female', label: 'UK / US English · Female', match: scorer(isIntl, INTL_FEMALE, /\bmale\b/i) },
  { id: 'intl-male', label: 'UK / US English · Male', match: scorer(isIntl, INTL_MALE, /female/i) },
];

function bestVoice(preset: VoicePreset, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  let best: SpeechSynthesisVoice | undefined;
  let bestScore = 0;
  for (const v of voices) {
    const sc = preset.match(v);
    if (sc > bestScore) {
      best = v;
      bestScore = sc;
    }
  }
  return best;
}

export interface VoiceOption {
  id: VoiceId;
  label: string;
  voice: SpeechSynthesisVoice;
}

/** The presets this device can play, each with the voice it resolves to. */
export function voiceOptions(): VoiceOption[] {
  if (!canSpeak()) return [];
  const voices = window.speechSynthesis.getVoices();
  const used = new Set<string>();
  const out: VoiceOption[] = [];
  for (const p of VOICE_PRESETS) {
    const voice = bestVoice(p, voices);
    // An Indian "female" and "male" preset must not both land on the same voice.
    if (voice && !used.has(voice.voiceURI)) {
      used.add(voice.voiceURI);
      out.push({ id: p.id, label: p.label, voice });
    }
  }
  return out;
}

/** Voices load asynchronously in Chrome; this resolves once they're in (or after 1.5s). */
export function voicesReady(): Promise<void> {
  if (!canSpeak() || window.speechSynthesis.getVoices().length) return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', done);
      resolve();
    };
    window.speechSynthesis.addEventListener('voiceschanged', done);
    setTimeout(done, 1500);
  });
}

const SETTINGS_KEY = 'vizucode-interview-voice';
export interface VoiceSettings {
  voice: VoiceId | null;
  speed: Speed;
}
const RATE: Record<Speed, number> = { slow: 0.85, normal: 1, fast: 1.15 };

export function getVoiceSettings(): VoiceSettings {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') as Partial<VoiceSettings>;
    return { voice: s.voice ?? null, speed: s.speed && s.speed in RATE ? s.speed : 'normal' };
  } catch {
    return { voice: null, speed: 'normal' };
  }
}

export function saveVoiceSettings(s: VoiceSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* private mode — the choice just isn't remembered */
  }
}

/** The chosen voice if this device has it, else the first available option. */
function currentVoice(): SpeechSynthesisVoice | undefined {
  const opts = voiceOptions();
  const want = getVoiceSettings().voice;
  return (opts.find((o) => o.id === want) ?? opts[0])?.voice ??
    window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('en'));
}

// Lets the interviewer avatar animate whenever the site is talking.
let speakingNow = false;
const speechListeners = new Set<(on: boolean) => void>();
function setSpeaking(on: boolean) {
  if (on === speakingNow) return;
  speakingNow = on;
  speechListeners.forEach((fn) => fn(on));
}
export const isSpeaking = () => speakingNow;
export function onSpeakingChange(fn: (on: boolean) => void): () => void {
  speechListeners.add(fn);
  return () => speechListeners.delete(fn);
}

/**
 * Speak `text`; resolves when done (or immediately if speech isn't available).
 * Spoken a sentence at a time: Chrome's online voices stop after ~15 seconds
 * of a single long utterance.
 */
export function speak(text: string): Promise<void> {
  if (!canSpeak()) return Promise.resolve();
  const synth = window.speechSynthesis;
  synth.cancel();
  const voice = currentVoice();
  const rate = RATE[getVoiceSettings().speed];
  const parts = text.split(/(?<=[.!?])\s+/).map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return Promise.resolve();
  const run = ++speechRun;
  setSpeaking(true);
  return new Promise<void>((resolve) => {
    let left = parts.length;
    for (const part of parts) {
      const u = new SpeechSynthesisUtterance(part);
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? 'en-IN';
      u.rate = rate;
      u.onend = () => --left === 0 && resolve();
      // cancel() (stop, or a new question) fires error on each queued part.
      u.onerror = () => {
        left = 0;
        resolve();
      };
      synth.speak(u);
    }
  }).finally(() => {
    // A newer speak() may have started in the meantime — it owns the flag now.
    if (run === speechRun) setSpeaking(false);
  });
}
let speechRun = 0;

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
  speechRun++;
  setSpeaking(false);
}

// ---------- recording ----------

export const canRecord = () =>
  typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

/** First container this browser can record: Chrome/Firefox → webm/ogg, Safari → mp4. */
function recorderMime(): string | undefined {
  const options = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4', 'audio/aac'];
  return options.find((m) => MediaRecorder.isTypeSupported(m));
}

export interface Recording {
  stop: () => Promise<Blob>;
  cancel: () => void;
  /** Current loudness of the mic, 0–1 (for the listening animation). */
  level: () => number;
}

/** Start recording from the microphone. Throws if permission is denied. */
export async function startRecording(): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
  });
  const mime = recorderMime();
  // ~32 kbps keeps a 3-minute answer around 0.7 MB.
  const rec = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), audioBitsPerSecond: 32_000 });
  const chunks: Blob[] = [];
  rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
  rec.start(1000);
  // Loudness meter. Optional: if Web Audio is unavailable the level stays 0.
  let ctx: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  try {
    ctx = new AudioContext();
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
  } catch {
    analyser = null;
  }
  const samples = new Uint8Array(512);
  const level = () => {
    if (!analyser) return 0;
    analyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (const v of samples) sum += (v - 128) * (v - 128);
    return Math.min(1, Math.sqrt(sum / samples.length) / 40);
  };
  const release = () => {
    stream.getTracks().forEach((t) => t.stop());
    void ctx?.close().catch(() => {});
  };
  return {
    level,
    stop: () =>
      new Promise((resolve) => {
        rec.onstop = () => {
          release();
          resolve(new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' }));
        };
        rec.stop();
      }),
    cancel: () => {
      rec.onstop = release;
      if (rec.state !== 'inactive') rec.stop();
      else release();
    },
  };
}
