import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applySession, getSession, onAuthChange } from '../lib/auth';
import { FREE_CATEGORY } from '../lib/plan';
import { createOrder, verifyPayment } from '../lib/api';
import { loadRazorpayScript } from '../lib/razorpay';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

const FEATURES = [
  `Everything in Free (${FREE_CATEGORY} stays open either way)`,
  'All 158 questions across every pattern, unlocked',
  'Full step-by-step visualizers for every problem',
  'Progress tracking, streaks and solve counts across all categories',
];

export default function UpgradePage() {
  const [session, setSession] = useState(getSession);
  const [status, setStatus] = useState<'idle' | 'starting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  async function startCheckout() {
    if (!session) return;
    if (!RAZORPAY_KEY_ID) {
      setError('Payments are not configured (missing VITE_RAZORPAY_KEY_ID).');
      return;
    }
    setError(null);
    setStatus('starting');
    try {
      await loadRazorpayScript();
      const order = await createOrder(session.token);
      const rzp = new window.Razorpay!({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'VizuCode',
        description: 'Unlock every pattern',
        prefill: { name: session.user.firstName, email: session.user.email },
        theme: { color: '#b96f27' },
        handler: (response) => {
          verifyPayment(session.token, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
            .then((fresh) => {
              applySession(fresh);
              navigate('/');
            })
            .catch((e: Error) => setError(e.message))
            .finally(() => setStatus('idle'));
        },
        modal: {
          ondismiss: () => setStatus('idle'),
        },
      });
      rzp.on('payment.failed', (resp) => {
        setError(resp.error?.description ?? 'Payment failed — try again.');
        setStatus('idle');
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start checkout.');
      setStatus('idle');
    }
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

        {session?.user.isPro ? (
          <p className="auth-hint upgrade-note">You're already Pro — everything is unlocked. 🎉</p>
        ) : session ? (
          <>
            <button className="btn primary auth-submit" onClick={startCheckout} disabled={status === 'starting'}>
              {status === 'starting' ? 'Opening Razorpay…' : 'Pay with Razorpay'}
            </button>
            {error && (
              <p className="input-error" role="alert">
                {error}
              </p>
            )}
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
