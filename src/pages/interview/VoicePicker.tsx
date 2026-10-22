// Interviewer voice + speed. Full cards with a preview on the setup page; a
// compact pair of dropdowns during the interview. The choice is remembered.
import { useEffect, useState } from 'react';
import {
  canSpeak,
  getVoiceSettings,
  saveVoiceSettings,
  speak,
  stopSpeaking,
  voiceOptions,
  voicesReady,
  type Speed,
  type VoiceId,
  type VoiceOption,
} from '../../lib/interview';
import { Icon } from '../../components/Icon';

const SAMPLE = 'Hi, I will be your interviewer today. Tell me about a project you are proud of.';
const SPEEDS: { id: Speed; label: string }[] = [
  { id: 'slow', label: 'Slow' },
  { id: 'normal', label: 'Normal' },
  { id: 'fast', label: 'Fast' },
];

function useVoiceOptions() {
  const [opts, setOpts] = useState<VoiceOption[]>(() => voiceOptions());
  useEffect(() => {
    if (!canSpeak()) return;
    let live = true;
    voicesReady().then(() => live && setOpts(voiceOptions()));
    // Chrome may add its online voices a moment later.
    const refresh = () => setOpts(voiceOptions());
    window.speechSynthesis.addEventListener('voiceschanged', refresh);
    return () => {
      live = false;
      window.speechSynthesis.removeEventListener('voiceschanged', refresh);
    };
  }, []);
  return opts;
}

export default function VoicePicker({ compact = false }: { compact?: boolean }) {
  const opts = useVoiceOptions();
  const [settings, setSettings] = useState(getVoiceSettings);
  const [playing, setPlaying] = useState<VoiceId | null>(null);

  useEffect(() => () => stopSpeaking(), []);

  if (!canSpeak() || opts.length === 0) return null;
  const selected = opts.find((o) => o.id === settings.voice)?.id ?? opts[0].id;

  function update(next: Partial<typeof settings>) {
    const s = { ...settings, voice: selected, ...next };
    setSettings(s);
    saveVoiceSettings(s);
    return s;
  }

  async function preview(id: VoiceId, speed = settings.speed) {
    update({ voice: id, speed });
    setPlaying(id);
    await speak(SAMPLE);
    setPlaying((p) => (p === id ? null : p));
  }

  if (compact) {
    return (
      <div className="iv-voice-compact">
        <select
          className="iv-select"
          aria-label="Interviewer voice"
          value={selected}
          onChange={(e) => update({ voice: e.target.value as VoiceId })}
        >
          {opts.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
        <select
          className="iv-select"
          aria-label="Speaking speed"
          value={settings.speed}
          onChange={(e) => update({ speed: e.target.value as Speed })}
        >
          {SPEEDS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="iv-voice">
      <span className="iv-label">Interviewer voice</span>
      <div className="iv-voice-grid" role="radiogroup" aria-label="Interviewer voice">
        {opts.map((o) => (
          <div
            key={o.id}
            role="radio"
            aria-checked={o.id === selected}
            tabIndex={0}
            className={`iv-voice-card ${o.id === selected ? 'on' : ''}`}
            onClick={() => update({ voice: o.id })}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), update({ voice: o.id }))}
          >
            <div className="iv-voice-text">
              <b>{o.label}</b>
              <span className="faint">{o.voice.name.replace(/^Microsoft |^Google /, '').replace(/ - .*$/, '')}</span>
            </div>
            <button
              type="button"
              className="btn icon iv-voice-play"
              aria-label={`Preview ${o.label}`}
              onClick={(e) => {
                e.stopPropagation();
                if (playing === o.id) {
                  stopSpeaking();
                  setPlaying(null);
                } else void preview(o.id);
              }}
            >
              <Icon name={playing === o.id ? 'stop' : 'play'} size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="iv-speed" role="radiogroup" aria-label="Speaking speed">
        <span className="faint iv-small">Speed</span>
        {SPEEDS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={settings.speed === s.id}
            className={`iv-speed-btn ${settings.speed === s.id ? 'on' : ''}`}
            onClick={() => update({ speed: s.id })}
          >
            {s.label}
          </button>
        ))}
      </div>
      {opts.length === 1 && (
        <p className="faint iv-small">Only one English voice is installed on this device. Chrome or Edge offer more.</p>
      )}
    </div>
  );
}
