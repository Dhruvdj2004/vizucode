import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applySession, getSession, onAuthChange, isCollegeEmail, sendCollegeCode, verifyCollegeCode } from '../lib/auth';
import { CodeField } from '../components/CodeField';
import { FREE_CATEGORY } from '../lib/plan';
import { createOrder, verifyPayment } from '../lib/api';
import { loadRazorpayScript } from '../lib/razorpay';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;

// Display only — the server charges ₹49 and refuses college accounts, which
// get Pro free by verifying their @ietdavv.edu.in email instead.
function displayPrice(email: string | undefined): string {
  return isCollegeEmail(email) ? 'Free' : '₹49';
}

const FEATURES = [
  `Everything in Free (${FREE_CATEGORY} stays open either way)`,
  'All 309 questions across every pattern, unlocked',
  'Full step-by-step visualizers for every problem',
  'Progress tracking, streaks and solve counts across all categories',
  '13 AI mock interviews instead of 1 — including 3 premium ones on Gemini',
];

export default function UpgradePage() {
  const [session, setSession] = useState(getSession);
  const [status, setStatus] = useState<'idle' | 'starting'>('idle');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isStudent = isCollegeEmail(session?.user.email);
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
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
        theme: { color: '#2563eb' },
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

  async function sendCode() {
    if (!session) return;
    setError(null);
    setVerifying(true);
    try {
      await sendCollegeCode(session.token);
      setCodeSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the code.');
    } finally {
      setVerifying(false);
    }
  }

  async function verify() {
    if (!session) return;
    setError(null);
    setVerifying(true);
    try {
      await verifyCollegeCode(session.token, code);
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not verify the code.');
    } finally {
      setVerifying(false);
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
          <span className="price-amount mono">{displayPrice(session?.user.email)}</span>
          <span className="price-period">{isStudent ? 'for IET DAVV students' : 'one-time'}</span>
        </div>

        <ul className="feature-list">
          {(isStudent ? [...FEATURES.slice(0, -1), '10 free AI mock interviews'] : FEATURES).map((f) => (
            <li key={f}>
              <span className="feature-check" aria-hidden>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {session?.user.isPro ? (
          <p className="auth-hint upgrade-note">
            {isStudent
              ? 'Your IET DAVV account is verified — everything is free and unlocked.'
              : "You're already Pro — everything is unlocked."}
          </p>
        ) : session && isStudent ? (
          <>
            <p className="auth-hint upgrade-note">
              IET DAVV students get everything free. Verify <b>{session.user.email}</b> with a 6-digit code.
            </p>
            {codeSent && <CodeField id="college-code" value={code} onChange={setCode} />}
            {codeSent ? (
              <button className="btn primary auth-submit" onClick={verify} disabled={verifying || code.length !== 6}>
                {verifying ? 'Checking…' : 'Verify and unlock'}
              </button>
            ) : (
              <button className="btn primary auth-submit" onClick={sendCode} disabled={verifying}>
                {verifying ? 'Sending…' : 'Send code to my college email'}
              </button>
            )}
            {codeSent && (
              <div className="auth-row">
                <button className="link-btn" type="button" onClick={sendCode} disabled={verifying}>
                  Resend code
                </button>
              </div>
            )}
            {error && (
              <p className="input-error" role="alert">
                {error}
              </p>
            )}
          </>
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
          <Link to="/dsa">← Back to questions</Link>
        </p>
      </div>
    </main>
  );
}
