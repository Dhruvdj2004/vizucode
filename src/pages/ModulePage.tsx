// Index page for a theory module: units, topic cards, lock state.
// Rendered for both /dbms and /os — see src/content/module.ts.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ContentModule } from '../content/module';
import { isTopicLocked, moduleStats, moduleUnits } from '../content/module';
import { getSession, onAuthChange } from '../lib/auth';

export default function ModulePage({ mod }: { mod: ContentModule }) {
  const [session, setSession] = useState(getSession);
  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  const units = moduleUnits(mod);
  const stats = moduleStats(mod);

  return (
    <>
      <div className="viz-header">
        <div className="eyebrow">{mod.eyebrow}</div>
        <h1 className="page-title">{mod.title}</h1>
        {mod.intro(stats) && <p className="serif desc">{mod.intro(stats)}</p>}
      </div>

      {units.map(({ unit, topics }) => (
        <section key={unit} className="db-unit">
          <div className="db-unit-head">
            <h2>{unit}</h2>
            <span className="count">
              {topics.length} topic{topics.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="db-cards">
            {topics.map((t) => {
              const locked = isTopicLocked(t, session?.user);
              return (
                <Link
                  key={t.slug}
                  to={locked ? '/upgrade' : `/${mod.key}/${t.slug}`}
                  className={`panel db-card ${locked ? 'locked' : ''}`}
                >
                  <div className="db-card-top">
                    <span className="db-card-num">{String(t.num).padStart(2, '0')}</span>
                    {locked && <span className="db-card-lock">🔒</span>}
                    <span className="db-card-mins">{t.minutes} min</span>
                  </div>
                  <div className="db-card-title">{t.title}</div>
                  <p className="db-card-blurb">{t.blurb}</p>
                  <div className="db-chips">
                    {t.free && <span className="db-chip free">Free</span>}
                    {t.tags.map((tag) => (
                      <span key={tag} className={`db-chip ${tag.toLowerCase().includes('very common') ? 'hot' : ''}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
