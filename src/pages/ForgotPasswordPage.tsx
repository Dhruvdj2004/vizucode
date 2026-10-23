import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../lib/auth';
import { CodeField } from '../components/CodeField';
import { PasswordField } from '../components/PasswordField';

/** Two steps: ask for the email, then enter the emailed code and a new password. */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      await forgotPassword(email);
      if (sent) setNote('New code sent.');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onReset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await resetPassword(email, code, password);
      navigate('/login', { state: { reset: true, email } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-wrap">
      <div className="panel auth-panel">
        <div className="eyebrow">Forgot password</div>
        <h1 className="auth-title">{sent ? 'Set a new password' : 'Reset your password'}</h1>
        {!sent ? (
          <>
            <p className="auth-sub">Enter your account email and we'll send you a 6-digit code.</p>
            <form onSubmit={sendCode} noValidate>
              <div className="field auth-field">
                <label htmlFor="fp-email">Email</label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="input-error" role="alert">
                  {error}
                </p>
              )}
              <button className="btn primary auth-submit" type="submit" disabled={busy || !email.trim()}>
                {busy ? 'Sending…' : 'Send code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="auth-sub">
              If <b>{email}</b> has an account, a code is on its way. It expires in 10 minutes.
            </p>
            <form onSubmit={onReset} noValidate>
              <CodeField id="fp-code" value={code} onChange={setCode} />
              <PasswordField
                id="fp-password"
                label="New password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                hint="At least 8 characters. You'll be signed out on every device."
              />
              {error && (
                <p className="input-error" role="alert">
                  {error}
                </p>
              )}
              {note && <p className="auth-success">{note}</p>}
              <button
                className="btn primary auth-submit"
                type="submit"
                disabled={busy || code.length !== 6 || password.length < 8}
              >
                {busy ? 'Saving…' : 'Save new password'}
              </button>
            </form>
            <div className="auth-row">
              <button className="link-btn" type="button" onClick={() => sendCode()} disabled={busy}>
                Resend code
              </button>
              <button
                className="link-btn"
                type="button"
                onClick={() => {
                  setSent(false);
                  setCode('');
                  setError(null);
                  setNote(null);
                }}
              >
                Use a different email
              </button>
            </div>
          </>
        )}
        <p className="auth-alt">
          <Link to="/login">← Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
