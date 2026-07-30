import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSession, onAuthChange } from '../lib/auth';
import { FREE_CATEGORY } from '../lib/plan';

const FEATURES = [
  `Everything in Free (${FREE_CATEGORY} stays open either way)`,
  'All 158 questions across every pattern, unlocked',
  'Full step-by-step visualizers for every problem',
  'Progress tracking, streaks and solve counts across all categories',
];

export default function UpgradePage() {
  const [session, setSession] = useState(getSession);
  const [status, setStatus] = useState<'idle' | 'starting'>('idle');
  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  function startCheckout() {
    setStatus('starting');
    // Razorpay wiring goes here next: create an order via POST
    // /api/payment/create-order, open Checkout with the returned order id,
    // then verify the signature server-side and flip the user to isPro.
    window.setTimeout(() => setStatus('idle'), 1200);
  }

  return (
    <main className="auth-wrap">
      <div className="panel auth-panel upgrade-panel">
        <div className="eyebrow">Go Pro</div>
        <h1 className="auth-title">Unlock every pattern</h1>
        <p className="auth-sub">
          Free accounts get full access to {FREE_CATEGORY}. Upgrade to unlock the rest — Two Pointers,
          Sliding Window, Trees, Graphs, DP and more.
        </p>

        <div className="price-row">
          <span className="price-amount mono">₹49</span>
          <span className="price-period">one-time</span>
        </div>

        <ul className="feature-list">
          {FEATURES.map((f) => (
            <li key={f}>
              <span className="feature-check" aria-hidden>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {session ? (
          <>
            <button className="btn primary auth-submit" onClick={startCheckout} disabled={status === 'starting'}>
              {status === 'starting' ? 'Opening Razorpay…' : 'Pay with Razorpay'}
            </button>
            <p className="auth-hint upgrade-note">
              Payment integration is being wired up — checkout will open here shortly.
            </p>
          </>
        ) : (
          <>
            <Link to="/login">
              <button className="btn primary auth-submit">Sign in to upgrade</button>
            </Link>
            <p className="auth-hint upgrade-note">You'll need an account before upgrading.</p>
          </>
        )}

        <p className="auth-alt">
          <Link to="/">← Back to questions</Link>
        </p>
      </div>
    </main>
  );
}
