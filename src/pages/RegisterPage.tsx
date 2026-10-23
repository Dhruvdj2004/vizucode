import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, verifyRegistration, isCollegeEmail, type DeviceSession } from '../lib/auth';
import { CodeField } from '../components/CodeField';
import GoogleSignInButton from '../lib/GoogleSignInButton';
import { PasswordField } from '../components/PasswordField';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [devices, setDevices] = useState<DeviceSession[] | null>(null);
  // College sign-ups get a second step: enter the code we emailed.
  const [codeStep, setCodeStep] = useState(false);
  const [code, setCode] = useState('');
  const [note, setNote] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNote(null);
    setBusy(true);
    try {
      const r = await register(email, password, firstName);
      if ('verify' in r) {
        setCodeStep(true);
        setCode('');
      } else navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await verifyRegistration(email, code);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    setNote(null);
    try {
      await register(email, password, firstName);
      setNote('New code sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend the code.');
    }
  }

  if (codeStep) {
    return (
      <main className="auth-wrap">
        <div className="panel auth-panel">
          <div className="eyebrow">Verify college email</div>
          <h1 className="auth-title">Check your inbox</h1>
          <p className="auth-sub">
            We sent a 6-digit code to <b>{email}</b>. Enter it to create your account. IET DAVV accounts get
            everything free.
          </p>
          <form onSubmit={onVerify} noValidate>
            <CodeField id="reg-code" value={code} onChange={setCode} />
            {error && (
              <p className="input-error" role="alert">
                {error}
              </p>
            )}
            {note && <p className="auth-success">{note}</p>}
            <button className="btn primary auth-submit" type="submit" disabled={busy || code.length !== 6}>
              {busy ? 'Checking…' : 'Verify and create account'}
            </button>
          </form>
          <div className="auth-row">
            <button className="link-btn" type="button" onClick={resend}>
              Resend code
            </button>
            <button
              className="link-btn"
              type="button"
              onClick={() => {
                setCodeStep(false);
                setError(null);
                setNote(null);
              }}
            >
              Use a different email
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-wrap">
      <div className="panel auth-panel">
        <div className="eyebrow">Create account</div>
        <h1 className="auth-title">Join VizuCode</h1>
        <p className="auth-sub">Track your progress through 309 visualized problems.</p>
        <form onSubmit={onSubmit} noValidate>
          <div className="field auth-field">
            <label htmlFor="reg-name">First name</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="field auth-field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <PasswordField
            id="reg-password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            hint="At least 8 characters."
          />
          {isCollegeEmail(email) && (
            <p className="auth-hint">IET DAVV email: we'll send you a code to verify it, then everything is free.</p>
          )}
          {error && (
            <p className="input-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary auth-submit" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : isCollegeEmail(email) ? 'Send verification code' : 'Create account'}
          </button>
        </form>
        <div className="auth-divider">or</div>
        <GoogleSignInButton
          onSuccess={() => navigate('/')}
          onDeviceLimit={(sessions) => setDevices(sessions)}
          onError={setError}
        />
        {devices && (
          <p className="input-error" role="alert">
            You're already signed in on {devices.length} devices — sign in at{' '}
            <Link to="/login">the sign-in page</Link> to sign one out first.
          </p>
        )}
        <p className="auth-alt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
