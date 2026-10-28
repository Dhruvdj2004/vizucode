import { useEffect, useRef, useState } from 'react';
import type { CodeLine } from '../lib/types';

interface Props {
  code: { cpp: CodeLine[]; java: CodeLine[] };
  activeTag?: string;
  activeTag2?: string;
}

export default function CodePanel({ code, activeTag, activeTag2 }: Props) {
  const [lang, setLang] = useState<'cpp' | 'java'>('cpp');
  const lines = code[lang];
  const bodyRef = useRef<HTMLPreElement>(null);

  // Keep the highlighted line in view by scrolling the code box itself (never
  // the page), so long solutions stay readable in the fixed-height layout.
  useEffect(() => {
    const body = bodyRef.current;
    const hl = body?.querySelector<HTMLElement>('.code-line.hl-a, .code-line.hl-b');
    if (!body || !hl || body.scrollHeight <= body.clientHeight) return;
    const top = hl.offsetTop;
    const bottom = top + hl.offsetHeight;
    if (top < body.scrollTop + 8 || bottom > body.scrollTop + body.clientHeight - 8) {
      body.scrollTo({ top: Math.max(0, top - body.clientHeight / 3), behavior: 'smooth' });
    }
  }, [activeTag, activeTag2, lang]);

  return (
    <div className="panel code-panel">
      <div className="code-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={lang === 'cpp'}
          className={`code-tab ${lang === 'cpp' ? 'active' : ''}`}
          onClick={() => setLang('cpp')}
        >
          C++
        </button>
        <button
          role="tab"
          aria-selected={lang === 'java'}
          className={`code-tab ${lang === 'java' ? 'active' : ''}`}
          onClick={() => setLang('java')}
        >
          Java
        </button>
      </div>
      <pre className="code-body" ref={bodyRef}>
        {lines.map((line, i) => {
          const primary = activeTag && line.tags?.includes(activeTag);
          const secondary = !primary && activeTag2 && line.tags?.includes(activeTag2);
          return (
            <div key={i} className={`code-line ${primary ? 'hl-a' : secondary ? 'hl-b' : ''}`}>
              <span className="ln">{i + 1}</span>
              <span className="code-text">{line.text || ' '}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
