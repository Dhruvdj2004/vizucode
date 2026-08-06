import { useState } from 'react';
import type { Block, QA } from '../content/types';

const TONE_LABEL: Record<string, string> = {
  tip: 'Remember',
  warn: 'Common mistake',
  exam: 'Asked in interviews',
};

function BlockView({ b }: { b: Block }) {
  switch (b.k) {
    case 'h':
      return <h3 className="db-h3">{b.text}</h3>;

    case 'p':
      return <p className="db-p">{b.text}</p>;

    case 'ul':
      return (
        <ul className="db-list">
          {b.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol className="db-list numbered">
          {b.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      );

    case 'steps':
      return (
        <div className="db-steps">
          {b.items.map((s, i) => (
            <div key={i} className="db-step">
              <span className="db-step-n mono">{i + 1}</span>
              <div>
                <div className="db-step-t">{s.t}</div>
                <div className="db-step-d">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'diagram':
      return (
        <figure className="db-figure">
          <div className="db-figure-canvas">{b.el}</div>
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );

    case 'table':
      return (
        <figure className="db-figure">
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  {b.head.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {b.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) => (
                      <td key={c}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );

    case 'code':
      return (
        <div className="db-code">
          {b.title && <div className="db-code-title">{b.title}</div>}
          <pre>{b.code}</pre>
        </div>
      );

    case 'note':
      return (
        <aside className={`db-note ${b.tone}`}>
          <div className="db-note-label">{b.title ?? TONE_LABEL[b.tone]}</div>
          <div className="db-note-body">{b.text}</div>
        </aside>
      );
  }
}

export function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} b={b} />
      ))}
    </>
  );
}

/** Interview Q&A accordion — answers start collapsed so it doubles as self-testing. */
export function InterviewList({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const allOpen = items.length > 0 && items.every((_, i) => open[i]);

  return (
    <div className="db-qa">
      <button
        className="btn db-qa-toggle"
        onClick={() => setOpen(allOpen ? {} : Object.fromEntries(items.map((_, i) => [i, true])))}
      >
        {allOpen ? 'Collapse all' : 'Reveal all answers'}
      </button>
      {items.map((qa, i) => (
        <div key={i} className={`db-qa-item ${open[i] ? 'open' : ''}`}>
          <button className="db-qa-q" onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))} aria-expanded={!!open[i]}>
            <span className="db-qa-n mono">Q{i + 1}</span>
            <span className="db-qa-text">{qa.q}</span>
            <span className="db-qa-chev" aria-hidden>
              ▾
            </span>
          </button>
          {open[i] && <div className="db-qa-a">{qa.a}</div>}
        </div>
      ))}
    </div>
  );
}
