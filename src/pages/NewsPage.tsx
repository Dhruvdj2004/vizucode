// Public daily "Top 5 in AI" page. Filled once a day by the cron job in
// server/news.ts; this page only reads. Open to signed-out visitors, so it
// doubles as a way in — they get a sign-up nudge under the stories.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchNews, type NewsDay } from '../lib/api';
import { getSession, onAuthChange } from '../lib/auth';

/** "2026-09-24" → "Thursday, 24 September 2026", read as a calendar date (no TZ shift). */
function longDate(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function shortDate(day: string): string {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' });
}

function ago(iso: string): string {
  const h = Math.round((Date.now() - Date.parse(iso)) / 3600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

export default function NewsPage() {
  const [session, setSession] = useState(getSession);
  const [data, setData] = useState<NewsDay | null>(null);
  const [day, setDay] = useState<string | undefined>();
  const [error, setError] = useState(false);

  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  useEffect(() => {
    document.title = 'Top 5 AI News Today — VizuCode';
    return () => {
      document.title = 'VizuCode — LeetCode Visualizer';
    };
  }, []);

  useEffect(() => {
    let live = true;
    setError(false);
    fetchNews(day)
      .then((d) => live && setData(d))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [day]);

  const shown = data?.day ?? null;

  return (
    <main>
      <div className="viz-header">
        <div className="eyebrow">Daily digest · updated 7 AM IST</div>
        <h1 className="page-title">Top 5 in AI</h1>
        <p className="serif desc">
          The five AI stories that matter most each day, in plain English — picked from TechCrunch, The Verge, MIT
          Technology Review, Ars Technica, Wired and Google News.
        </p>
      </div>

      {data && data.days.length > 1 && (
        <div className="news-days" role="tablist" aria-label="Choose a day">
          {data.days.slice(0, 7).map((d, i) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={d === shown}
              className={`news-day ${d === shown ? 'on' : ''}`}
              onClick={() => setDay(d)}
            >
              {i === 0 ? 'Latest' : shortDate(d)}
            </button>
          ))}
        </div>
      )}

      {error ? (
        <div className="panel serif">Couldn’t load the news right now. Please try again in a bit.</div>
      ) : !data ? (
        <div className="page-loading">Loading…</div>
      ) : !shown || data.items.length === 0 ? (
        <div className="panel serif">Today’s top 5 isn’t in yet — check back after 7 AM IST.</div>
      ) : (
        <>
          <div className="news-date">{longDate(shown)}</div>
          <ol className="news-list">
            {data.items.map((it) => (
              <li key={it.rank} className="panel news-card">
                <span className="news-rank mono" aria-hidden>
                  {it.rank}
                </span>
                <div className="news-body">
                  <h2 className="news-headline">
                    <a href={it.url} target="_blank" rel="noopener noreferrer">
                      {it.headline}
                    </a>
                  </h2>
                  <div className="news-meta">
                    {it.source} · {ago(it.publishedAt)}
                  </div>
                  <p className="news-summary">{it.summary}</p>
                  {it.why && (
                    <p className="news-why">
                      <b>Why it matters:</b> {it.why}
                    </p>
                  )}
                  <a className="news-read" href={it.url} target="_blank" rel="noopener noreferrer">
                    Read on {it.source} ↗
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      {!session && (
        <div className="panel news-cta">
          <div>
            <b>Learning to code for placements?</b>
            <p className="serif">
              VizuCode turns DSA problems into step-by-step visuals, with core CS subjects and aptitude practice
              alongside.
            </p>
          </div>
          <Link to="/register" className="btn primary">
            Sign up free →
          </Link>
        </div>
      )}
    </main>
  );
}
