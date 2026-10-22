// "Vizu", the AI interviewer: an animated SVG robot. Its mood follows the
// interview: talks while a question is read out, listens (rings pulse with the
// student's mic volume) while recording, thinks while grading, and reacts to
// the score.
import { useEffect, useRef } from 'react';

export type BotMood = 'idle' | 'speaking' | 'listening' | 'thinking' | 'happy' | 'concerned';

const STATUS: Record<BotMood, string> = {
  idle: 'Ready',
  speaking: 'Speaking…',
  listening: 'Listening…',
  thinking: 'Reviewing your answer…',
  happy: 'Nice answer!',
  concerned: 'Let’s look at this one',
};

export default function InterviewerBot({
  mood,
  level,
  size = 168,
  showStatus = true,
}: {
  mood: BotMood;
  /** Mic loudness 0–1 while listening. */
  level?: () => number;
  size?: number;
  showStatus?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);

  // Drive the listening rings from the mic level without re-rendering React.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (mood !== 'listening' || !level) {
      el.style.setProperty('--lvl', '0');
      return;
    }
    let raf = 0;
    let smooth = 0;
    const tick = () => {
      smooth = smooth * 0.7 + level() * 0.3;
      el.style.setProperty('--lvl', smooth.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mood, level]);

  const happy = mood === 'happy';

  return (
    <div ref={root} className={`bot mood-${mood}`} style={{ width: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label={`AI interviewer: ${STATUS[mood]}`}>
        <defs>
          <linearGradient id="bot-shell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className="bot-shell-top" />
            <stop offset="1" className="bot-shell-bottom" />
          </linearGradient>
          <radialGradient id="bot-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" className="bot-glow-in" />
            <stop offset="1" className="bot-glow-out" />
          </radialGradient>
        </defs>

        {/* listening rings, behind everything */}
        <g className="bot-rings">
          <circle cx="100" cy="94" r="78" />
          <circle cx="100" cy="94" r="78" />
        </g>

        {/* body */}
        <path className="bot-body" d="M52 200 C52 172 70 158 100 158 C130 158 148 172 148 200 Z" />
        <rect className="bot-neck" x="88" y="146" width="24" height="16" rx="6" />
        <circle className="bot-badge" cx="100" cy="182" r="7" />

        {/* antenna */}
        <line className="bot-stalk" x1="100" y1="40" x2="100" y2="20" />
        <circle className="bot-antenna" cx="100" cy="15" r="7" />

        {/* ears */}
        <rect className="bot-ear" x="22" y="78" width="18" height="38" rx="9" />
        <rect className="bot-ear" x="160" y="78" width="18" height="38" rx="9" />
        <rect className="bot-ear-light" x="27" y="90" width="8" height="14" rx="4" />
        <rect className="bot-ear-light" x="165" y="90" width="8" height="14" rx="4" />

        {/* head */}
        <rect className="bot-head" x="34" y="38" width="132" height="114" rx="38" fill="url(#bot-shell)" />
        <rect className="bot-visor" x="48" y="56" width="104" height="72" rx="26" />
        <ellipse cx="100" cy="92" rx="46" ry="30" fill="url(#bot-glow)" />
        <path className="bot-shine" d="M60 66 Q66 60 76 60" />

        {/* eyes */}
        <g className="bot-eyes">
          {happy ? (
            <>
              <path className="bot-eye-arc" d="M68 92 Q78 78 88 92" />
              <path className="bot-eye-arc" d="M112 92 Q122 78 132 92" />
            </>
          ) : (
            <>
              <rect className="bot-eye" x="70" y="76" width="17" height="24" rx="8.5" />
              <rect className="bot-eye" x="113" y="76" width="17" height="24" rx="8.5" />
              <circle className="bot-pupil" cx="81" cy="83" r="3" />
              <circle className="bot-pupil" cx="124" cy="83" r="3" />
            </>
          )}
        </g>

        {/* cheeks */}
        <circle className="bot-cheek" cx="62" cy="110" r="7" />
        <circle className="bot-cheek" cx="138" cy="110" r="7" />

        {/* mouth */}
        {mood === 'happy' ? (
          <path className="bot-smile" d="M86 108 Q100 120 114 108" />
        ) : mood === 'concerned' ? (
          <path className="bot-smile" d="M88 114 Q100 108 112 114" />
        ) : (
          <rect className="bot-mouth" x="86" y="108" width="28" height="7" rx="3.5" />
        )}

        {/* thinking dots */}
        <g className="bot-think">
          <circle cx="158" cy="30" r="5" />
          <circle cx="172" cy="18" r="6.5" />
          <circle cx="188" cy="8" r="8" />
        </g>
      </svg>
      {showStatus && (
        <div className="bot-status" aria-live="polite">
          <span className="bot-dot" />
          {STATUS[mood]}
        </div>
      )}
    </div>
  );
}
