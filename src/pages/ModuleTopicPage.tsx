// Reading page for one topic of a theory module: contents rail, section blocks,
// interview Q&A, prev/next. Rendered for both /dbms/:slug and /os/:slug.

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ContentModule } from '../content/module';
import { getTopic, isTopicLocked, moduleStats } from '../content/module';
import { DgDefs } from '../content/dgm';
import { Blocks, InterviewList } from '../components/ContentBlocks';
import { getSession, onAuthChange } from '../lib/auth';

export default function ModuleTopicPage({ mod }: { mod: ContentModule }) {
  const { slug } = useParams();
  const topic = getTopic(mod, slug);
  const [session, setSession] = useState(getSession);
  const [active, setActive] = useState<string>('');

  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  // Jumping between topics should land at the top, not mid-scroll. Braces matter:
  // a concise arrow would return scrollTo's value, which React treats as a
  // cleanup function and then throws "destroy is not a function" on unmount.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const locked = topic ? isTopicLocked(topic, session?.user) : false;

  // Contents rail highlights whichever section is nearest the top of the viewport.
  useEffect(() => {
    if (!topic || locked) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-8% 0px -70% 0px' }
    );
    for (const s of topic.sections) {
      const el = document.getElementById(s.id);
      if (el) obs.observe(el);
    }
    return () => obs.disconnect();
  }, [topic, locked]);

  // HashRouter owns the URL fragment, so an <a href="#section"> would replace the
  // route itself — #/revision/dp-pitfalls becomes #common-pitfalls, which matches
  // no route and navigates away instead of scrolling. There is no href form that
  // survives that, so the rail scrolls the section into view directly and leaves
  // the URL untouched.
  function jumpTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  }

  if (!topic) {
    return (
      <div className="panel serif">
        Topic not found. <Link to={`/${mod.key}`}>Back to the {mod.nav} module</Link>.
      </div>
    );
  }

  const idx = mod.topics.findIndex((t) => t.slug === topic.slug);
  const prev = mod.topics[idx - 1];
  const next = mod.topics[idx + 1];
  const stats = moduleStats(mod);

  if (locked) {
    return (
      <>
        <div className="db-topic-head">
          <Link to={`/${mod.key}`} className="db-back">
            {mod.back}
          </Link>
          <h1>{topic.title}</h1>
          <p className="serif desc">{topic.blurb}</p>
        </div>
        <div className="panel db-gate">
          <h2>🔒 This topic is part of Pro</h2>
          <p className="serif" style={{ maxWidth: '38rem', margin: '0 auto 1rem' }}>
            The first {stats.free} topics are free to read. Unlock the full {mod.nav} module — all {stats.topics}{' '}
            topics, diagrams and interview questions — along with every DSA visualizer.
          </p>
          <Link to="/upgrade">
            <button className="btn primary">Unlock everything</button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <DgDefs />

      <div className="db-topic-head">
        <Link to={`/${mod.key}`} className="db-back">
          {mod.back}
        </Link>
        <div className="eyebrow" style={{ marginTop: '0.5rem' }}>
          {topic.unit} · Topic {String(topic.num).padStart(2, '0')} · {topic.minutes} min read
        </div>
        <h1>{topic.title}</h1>
        <p className="serif desc">{topic.blurb}</p>
      </div>

      <div className="db-layout">
        <nav className="panel db-toc" aria-label="On this page">
          <div className="eyebrow">On this page</div>
          <ol>
            {[
              ...topic.sections.map((s) => ({ id: s.id, heading: s.heading })),
              { id: 'interview', heading: 'Interview questions' },
            ].map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={active === s.id ? 'on' : ''}
                  aria-current={active === s.id ? 'true' : undefined}
                  onClick={() => jumpTo(s.id)}
                >
                  {s.heading}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="db-body">
          {topic.sections.map((s) => (
            <section key={s.id} id={s.id} className="panel db-section">
              <h2>{s.heading}</h2>
              <Blocks blocks={s.blocks} />
            </section>
          ))}

          <section id="interview" className="panel db-section">
            <h2>Interview questions</h2>
            <p className="db-p">
              Tap a question and answer it out loud before revealing — that is the gap most people only discover
              in the actual interview.
            </p>
            {/* Keyed by slug so moving to another topic starts with every answer
                hidden — otherwise React reuses the instance and carries the
                previous topic's expanded state across. */}
            <InterviewList key={topic.slug} items={topic.interview} />
          </section>

          <div className="db-nav">
            {prev ? (
              <Link to={`/${mod.key}/${prev.slug}`} className="panel prev">
                <span className="dir">← Previous</span>
                <span className="t">{prev.title}</span>
              </Link>
            ) : (
              <span style={{ flex: 1 }} />
            )}
            {next ? (
              <Link to={`/${mod.key}/${next.slug}`} className="panel next">
                <span className="dir">Next →</span>
                <span className="t">{next.title}</span>
              </Link>
            ) : (
              <span style={{ flex: 1 }} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
