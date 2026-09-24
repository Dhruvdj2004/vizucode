import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { availableFor, difficultyTargets, fullConfig, topicConfig } from '../../aptitude/engine';
import { ALL_TOPICS, CATEGORIES, COMPANY_STYLES, TEST_COUNT, presetConfig } from '../../aptitude/taxonomy';
import type { Difficulty, TestConfig } from '../../aptitude/types';
import { launchTest, useAptHistory, useAptUser } from '../../aptitude/ui';

const TITLES: Record<string, string> = {
  full: 'Full Test',
  topic: 'Topic Practice',
  mixed: 'Mixed Practice',
  cs: 'Core CS OA',
  company: 'Company-style OA',
};

export default function AptitudeSetup() {
  const { mode = '' } = useParams();
  const navigate = useNavigate();
  const { uid } = useAptUser();
  const { active } = useAptHistory();

  const [selection, setSelection] = useState<TestConfig['selection']>('random');
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [topic, setTopic] = useState<string>('Percentages');
  const [count, setCount] = useState(10);
  const [focus, setFocus] = useState<Difficulty | 'mixed'>('mixed');
  const [company, setCompany] = useState(COMPANY_STYLES[0].key);

  const config: TestConfig | null = useMemo(() => {
    if (mode === 'full') return topics.size ? fullConfig([...topics], selection) : null;
    if (mode === 'topic') return topicConfig(topic, count, focus, selection);
    if (mode === 'mixed' || mode === 'cs') return presetConfig(mode, selection);
    if (mode === 'company') return presetConfig('company', selection, COMPANY_STYLES.find((c) => c.key === company));
    return null;
  }, [mode, topics, selection, topic, count, focus, company]);

  if (!TITLES[mode]) return <Navigate to="/aptitude" replace />;

  const pool = config ? availableFor(config.topics) : [];
  const n = config ? Math.min(config.count, pool.length) : 0;
  const minutes = config ? (config.mode === 'topic' ? n : config.durationSec / 60) : 0;
  const mix = difficultyTargets(n, config?.difficultyFocus);

  const toggle = (t: string) =>
    setTopics((s) => {
      const next = new Set(s);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  const setMany = (ts: string[], on: boolean) =>
    setTopics((s) => {
      const next = new Set(s);
      ts.forEach((t) => (on ? next.add(t) : next.delete(t)));
      return next;
    });

  return (
    <>
      <div className="viz-header">
        <Link to="/aptitude" className="apt-back">
          ← Aptitude &amp; OA
        </Link>
        <h1 className="page-title">{TITLES[mode]}</h1>
      </div>

      {active && (
        <div className="panel apt-resume">
          <div>
            You already have a test in progress (<b>{active.config.title}</b>). Starting a new one will discard it.
          </div>
          <Link to="/aptitude/test" className="btn primary">
            Resume instead →
          </Link>
        </div>
      )}

      <div className="apt-setup">
        <div className="apt-setup-main">
          {mode === 'full' && (
            <>
              <div className="apt-picker-bar">
                <span className="faint">Choose one or more topics.</span>
                <span className="apt-picker-actions">
                  <button className="btn" onClick={() => setMany(ALL_TOPICS, true)}>
                    Select all
                  </button>
                  <button className="btn" onClick={() => setTopics(new Set())} disabled={!topics.size}>
                    Clear all
                  </button>
                </span>
              </div>
              {CATEGORIES.map((c) => {
                const on = c.topics.filter((t) => topics.has(t)).length;
                const all = on === c.topics.length;
                return (
                  <section key={c.key} className="panel apt-cat">
                    <label className="apt-cat-head">
                      <input
                        type="checkbox"
                        checked={all}
                        ref={(el) => {
                          if (el) el.indeterminate = on > 0 && !all;
                        }}
                        onChange={() => setMany(c.topics, !all)}
                      />
                      <span className="apt-cat-icon" aria-hidden>
                        {c.icon}
                      </span>
                      <span className="apt-cat-name">{c.name}</span>
                      <span className="apt-cat-count mono">
                        {on}/{c.topics.length}
                      </span>
                    </label>
                    <div className="apt-chips">
                      {c.topics.map((t) => (
                        <label key={t} className={`apt-chip${topics.has(t) ? ' on' : ''}`}>
                          <input type="checkbox" checked={topics.has(t)} onChange={() => toggle(t)} />
                          {t}
                          <span className="apt-chip-n mono">{availableFor([t]).length}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}

          {mode === 'topic' && (
            <>
              {CATEGORIES.map((c) => (
                <section key={c.key} className="panel apt-cat">
                  <div className="apt-cat-head static">
                    <span className="apt-cat-icon" aria-hidden>
                      {c.icon}
                    </span>
                    <span className="apt-cat-name">{c.name}</span>
                  </div>
                  <div className="apt-chips" role="radiogroup" aria-label={c.name}>
                    {c.topics.map((t) => (
                      <label key={t} className={`apt-chip${topic === t ? ' on' : ''}`}>
                        <input type="radio" name="topic" checked={topic === t} onChange={() => setTopic(t)} />
                        {t}
                        <span className="apt-chip-n mono">{availableFor([t]).length}</span>
                      </label>
                    ))}
                  </div>
                </section>
              ))}
            </>
          )}

          {(mode === 'mixed' || mode === 'cs') && config && (
            <div className="panel">
              <p className="serif" style={{ marginTop: 0 }}>
                {mode === 'mixed'
                  ? 'A random, balanced set across every aptitude section — quantitative, logical, analytical and verbal — split evenly between them.'
                  : 'A placement-OA style technical round across the core CS subjects, including SQL-output and code-output questions.'}
              </p>
              <div className="apt-chips">
                {config.topics.map((t) => (
                  <span key={t} className="apt-chip on static">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mode === 'company' && (
            <>
              <p className="apt-disclaimer">
                <b>Company-style practice.</b> These tests mirror the <i>section mix</i> of each company's publicly described
                test pattern using questions from our own bank. They are not actual or leaked company questions.
              </p>
              <div className="apt-company-grid" role="radiogroup" aria-label="Company style">
                {COMPANY_STYLES.map((c) => (
                  <label key={c.key} className={`panel apt-company${company === c.key ? ' on' : ''}`}>
                    <input type="radio" name="company" checked={company === c.key} onChange={() => setCompany(c.key)} />
                    <span className="apt-company-name">{c.name}</span>
                    <span className="apt-company-blurb">{c.blurb}</span>
                    <span className="apt-company-mix mono">
                      {CATEGORIES.filter((x) => c.weights[x.key])
                        .map((x) => `${x.short} ${Math.round((c.weights[x.key] ?? 0) * 100)}%`)
                        .join(' · ')}
                    </span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <aside className="panel apt-summary">
          <h3 className="apt-h3">Test summary</h3>
          {mode === 'topic' && (
            <>
              <div className="apt-field-label">Questions</div>
              <div className="apt-seg">
                {[10, TEST_COUNT].map((c) => (
                  <button key={c} className={count === c ? 'on' : ''} onClick={() => setCount(c)}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="apt-field-label">Difficulty</div>
              <div className="apt-seg">
                {(['mixed', 'easy', 'medium', 'hard'] as const).map((d) => (
                  <button key={d} className={focus === d ? 'on' : ''} onClick={() => setFocus(d)}>
                    {d[0].toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="apt-field-label">Question selection</div>
          <div className="apt-seg">
            <button className={selection === 'random' ? 'on' : ''} onClick={() => setSelection('random')}>
              Random
            </button>
            <button className={selection === 'smart' ? 'on' : ''} onClick={() => setSelection('smart')}>
              Smart
            </button>
          </div>
          <p className="apt-small faint" style={{ margin: '0.4rem 0 0' }}>
            {selection === 'random'
              ? 'A fresh random set every time.'
              : 'Prefers questions you have not seen, got wrong, or last saw long ago — and your weakest topics.'}
          </p>

          <dl className="apt-summary-list">
            <div>
              <dt>Questions</dt>
              <dd className="mono">{config ? n : '—'}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd className="mono">{config ? `${minutes} min` : '—'}</dd>
            </div>
            <div>
              <dt>Mix (E/M/H)</dt>
              <dd className="mono">{config ? `${mix.easy} / ${mix.medium} / ${mix.hard}` : '—'}</dd>
            </div>
            <div>
              <dt>Pool</dt>
              <dd className="mono">{config ? `${pool.length} questions` : '—'}</dd>
            </div>
          </dl>
          {config && pool.length < config.count && (
            <p className="apt-small apt-warn-text">
              Only {pool.length} questions exist for this selection, so the test will have {n}.
            </p>
          )}
          {config && pool.length >= config.count && config.difficultyFocus === undefined && (
            <p className="apt-small faint">If a difficulty runs short in these topics, the nearest level fills in.</p>
          )}
          <button className="btn primary apt-start" disabled={!config || n === 0} onClick={() => config && launchTest(navigate, uid, config)}>
            {config ? 'Start test' : 'Select at least one topic'}
          </button>
        </aside>
      </div>
    </>
  );
}
