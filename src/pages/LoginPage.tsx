import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, forceLogin, DeviceLimitError, type DeviceSession } from '../lib/auth';

export default function LoginPage() {
  const navigate = useNavigate();
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
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof DeviceLimitError) {
        setDevices(err.sessions);
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong — try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function signOutDevice(sessionId: string) {
    setError(null);
    setBusy(true);
    try {
      await forceLogin(email, password, sessionId);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  }

  if (devices) {
    return (
      <main className="auth-wrap">
        <div className="panel auth-panel">
          <div className="eyebrow">Too many devices</div>
          <h1 className="auth-title">You're signed in on 2 devices</h1>
          <p className="auth-sub">Sign out of one below to continue on this device.</p>
          <div className="device-list">
            {devices.map((d) => (
              <div className="device-row" key={d.id}>
                <div>
                  <div className="device-label">{d.label}</div>
                  <div className="device-date">Signed in {new Date(d.createdAt).toLocaleString()}</div>
                </div>
                <button className="btn" onClick={() => signOutDevice(d.id)} disabled={busy}>
                  Sign out
                </button>
              </div>
            ))}
          </div>
          {error && (
            <p className="input-error" role="alert">
              {error}
            </p>
          )}
          <p className="auth-alt">
            <button type="button" className="link-btn" onClick={() => setDevices(null)}>
              ← Back
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-wrap">
      <div className="panel auth-panel">
        <div className="eyebrow">Welcome back</div>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">Pick up where you left off.</p>
        <form onSubmit={onSubmit} noValidate>
          <div className="field auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="input-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary auth-submit" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-alt">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
