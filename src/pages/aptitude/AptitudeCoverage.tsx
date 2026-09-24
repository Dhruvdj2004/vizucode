import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { coverage, missedQuestions, topicConfig, type CoverageRow } from '../../aptitude/engine';
import { QUESTION_BANK } from '../../aptitude/bank';
import { Bar, DIFF_LABEL, launchTest, pct, useAptHistory, useAptUser } from '../../aptitude/ui';

export default function AptitudeCoverage() {
  const { history } = useAptHistory();
  const navigate = useNavigate();
  const { uid } = useAptUser();
  const cats = coverage(history);
  const missed = missedQuestions(history);
  const seen = cats.reduce((a, c) => a + c.seen, 0);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (t: string) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });

  return (
    <>
      <div className="viz-header">
        <Link to="/aptitude" className="apt-back">
          ← Aptitude &amp; OA
        </Link>
        <h1 className="page-title">Coverage</h1>
        <p className="serif desc">
          How much of the question bank you have practised, topic by topic. A question counts as covered once it has
          appeared in one of your tests.
        </p>
      </div>

      <div className="panel apt-coverage-total">
        <div className="apt-coverage-cta-head">
          <b>Whole bank</b>
          <span className="mono">
            {seen}/{QUESTION_BANK.length} · {pct(seen, QUESTION_BANK.length)}%
          </span>
        </div>
        <Bar value={pct(seen, QUESTION_BANK.length)} tone="b" />
      </div>

      {cats.map((c) => (
        <section key={c.key} className="panel apt-cov-cat">
          <div className="apt-cov-cat-head">
            <span className="apt-cat-icon" aria-hidden>
              {c.icon}
            </span>
            <h2>{c.name}</h2>
            <span className="apt-spacer" />
            <span className="mono apt-small">
              {c.seen}/{c.total} · {pct(c.seen, c.total)}%
            </span>
          </div>
          <ul className="apt-cov-topics">
            {c.topics.map((t) => (
              <li key={t.name}>
                <button className="apt-cov-row" onClick={() => toggle(t.name)} aria-expanded={open.has(t.name)}>
                  <span className={`chev${open.has(t.name) ? ' open' : ''}`}>▶</span>
                  <span className="apt-cov-name">{t.name}</span>
                  <Bar value={pct(t.seen, t.total)} tone={t.seen === t.total && t.total ? 'b' : 'a'} />
                  <span className="mono apt-small apt-cov-pct">{pct(t.seen, t.total)}%</span>
                  <RowMeta r={t} />
                </button>
                {open.has(t.name) && (
                  <div className="apt-cov-subs">
                    {t.subtopics.map((s) => (
                      <div key={s.name} className="apt-cov-sub">
                        <span>{s.name}</span>
                        <span className="mono apt-small faint">
                          {s.seen}/{s.total} seen{s.answered > 0 && ` · ${pct(s.answeredCorrect, s.answered)}% accuracy`}
                        </span>
                      </div>
                    ))}
                    <button className="btn apt-cov-practice" onClick={() => launchTest(navigate, uid, topicConfig(t.name, Math.min(10, t.total), 'mixed', 'smart'))}>
                      Practise {t.name} ({Math.min(10, t.total)} Q)
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <h2 className="apt-h2">Questions to revisit</h2>
      {missed.length === 0 ? (
        <p className="faint">Questions you answer incorrectly show up here until you get them right.</p>
      ) : (
        missed.map(({ q, h }) => (
          <details key={q.id} className="panel apt-missed">
            <summary>
              <span className="apt-missed-q">{q.question.split('\n')[0]}</span>
              <span className="faint apt-small">
                {q.topic} · <span className={`badge ${q.difficulty}`}>{DIFF_LABEL[q.difficulty]}</span> · wrong {h.wrong}× of {h.seen}
              </span>
            </summary>
            <p className="apt-small">
              <b>Answer:</b> {q.options[q.correctAnswer]}
            </p>
            <p className="apt-explain">{q.explanation}</p>
          </details>
        ))
      )}
    </>
  );
}

function RowMeta({ r }: { r: CoverageRow }) {
  return (
    <span className="apt-cov-meta faint apt-small">
      {r.seen}/{r.total} seen
      {r.answered > 0 && ` · ${pct(r.answeredCorrect, r.answered)}% acc`}
      {r.wrong > 0 && ` · ${r.wrong} to revisit`}
    </span>
  );
}
