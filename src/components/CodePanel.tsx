import { useState } from 'react';
import type { CodeLine } from '../lib/types';

interface Props {
  code: { cpp: CodeLine[]; java: CodeLine[] };
  activeTag?: string;
  activeTag2?: string;
}

export default function CodePanel({ code, activeTag, activeTag2 }: Props) {
  const [lang, setLang] = useState<'cpp' | 'java'>('cpp');
  const lines = code[lang];

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
      <pre className="code-body">
        {lines.map((line, i) => {
          const primary = activeTag && line.tags?.includes(activeTag);
          const secondary = !primary && activeTag2 && line.tags?.includes(activeTag2);
          return (
            <div key={i} className={`code-line ${primary ? 'hl-a' : secondary ? 'hl-b' : ''}`}>
              <span className="ln">{i + 1}</span>
              <span>{line.text || ' '}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
