import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherLogin } from '../../lib/teacher';
import { PasswordField } from '../../components/PasswordField';

export default function TeacherLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await teacherLogin(email, password);
      navigate('/teacher');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-wrap">
      <div className="panel auth-panel">
        <div className="eyebrow">Teacher panel</div>
        <h1 className="auth-title">Teacher sign in</h1>
        <p className="auth-sub">Request a visualizer for any DSA question. Accounts are created by the VizuCode team.</p>
        <form onSubmit={onSubmit} noValidate>
          <div className="field auth-field">
            <label htmlFor="t-email">Email</label>
            <input id="t-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <PasswordField id="t-password" label="Password" value={password} onChange={setPassword} autoComplete="current-password" />
          {error && (
            <p className="input-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn primary auth-submit" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
