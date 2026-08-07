import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register, DeviceLimitError, type DeviceSession } from '../lib/auth';
import GoogleSignInButton from '../lib/GoogleSignInButton';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [devices, setDevices] = useState<DeviceSession[] | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await register(email, password, firstName);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-wrap">
      <div className="panel auth-panel">
        <div className="eyebrow">Create account</div>
        <h1 className="auth-title">Join VizuCode</h1>
        <p className="auth-sub">Track your progress through 158 visualized problems.</p>
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
          <div className="field auth-field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="auth-hint">At least 8 characters.</span>
          </div>
          {error && (
            <p className="input-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary auth-submit" type="submit" disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
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
