import { useEffect, useState, type FormEvent } from 'react';
import { getSession } from '../lib/auth';
import { fetchFeedback, submitFeedback, type FeedbackEntry } from '../lib/api';
import { StarRating } from '../components/StarRating';

export default function FeedbackPage() {
  const session = getSession();
  const [name, setName] = useState(session?.user.firstName ?? '');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  function loadFeedback() {
    fetchFeedback()
      .then((data) => {
        setEntries(data.entries);
        setAverage(data.average);
        setCount(data.count);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(loadFeedback, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (rating < 1) {
      setError('Pick a star rating.');
      return;
    }
    setBusy(true);
    try {
      const entry = await submitFeedback(name, rating, message);
      setEntries((prev) => [entry, ...prev]);
      setCount((c) => c + 1);
      setAverage((a) => (a * count + rating) / (count + 1));
      setMessage('');
      setRating(0);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit feedback.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <div className="eyebrow">We're listening</div>
      <h1 className="page-title" style={{ marginBottom: '0.35rem' }}>
        Feedback &amp; suggestions
      </h1>
      <p className="serif" style={{ marginBottom: '1.5rem' }}>
        Rate VizuCode and tell us what to build, fix, or improve next. No account needed.
      </p>

      <div className="feedback-layout">
        <div className="panel">
          <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Leave your feedback</h2>
          <form onSubmit={onSubmit} noValidate>
            <div className="field auth-field">
              <label htmlFor="fb-name">Name</label>
              <input
                id="fb-name"
                type="text"
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="field auth-field">
              <label>Rating</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="field auth-field">
              <label htmlFor="fb-message">Message</label>
              <textarea
                id="fb-message"
                rows={4}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="input-error" role="alert">
                {error}
              </p>
            )}
            {submitted && !error && <p className="auth-hint">Thanks — your feedback was submitted!</p>}
            <button className="btn primary auth-submit" type="submit" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit feedback'}
            </button>
          </form>
        </div>

        <div className="panel">
          <div className="feedback-summary">
            <h2 style={{ fontSize: '1.05rem' }}>What others are saying</h2>
            {count > 0 && (
              <div className="feedback-average">
                <StarRating value={Math.round(average)} readOnly />
                <span className="mono">{average.toFixed(1)} / 5</span>
                <span className="auth-hint">({count} review{count === 1 ? '' : 's'})</span>
              </div>
            )}
          </div>
          {loading ? (
            <p className="auth-hint">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="auth-hint">No feedback yet — be the first!</p>
          ) : (
            <ul className="feedback-list">
              {entries.map((e) => (
                <li key={e.id} className="feedback-item">
                  <div className="feedback-item-head">
                    <span className="feedback-item-name">{e.name}</span>
                    <StarRating value={e.rating} readOnly />
                  </div>
                  <p className="feedback-item-message">{e.message}</p>
                  <span className="feedback-item-date">{new Date(e.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
