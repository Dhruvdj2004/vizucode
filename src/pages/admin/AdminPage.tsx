import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, type AdminInfo, type RequestStatus, type RequestSummary } from '../../lib/teacher';

const TABS: (RequestStatus | 'all')[] = ['pending', 'accepted', 'published', 'rejected', 'all'];

type TeacherRow = { id: number; email: string; name: string; active: boolean; created_at: string; requests: number };

export default function AdminPage() {
  const [info, setInfo] = useState<AdminInfo | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const [tab, setTab] = useState<RequestStatus | 'all'>('pending');
  const [requests, setRequests] = useState<RequestSummary[] | null>(null);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [form, setForm] = useState({ email: '', name: '', password: '' });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .me()
      .then(setInfo)
      .catch((e) => setFatal(e.message));
    loadTeachers();
  }, []);

  useEffect(() => {
    setRequests(null);
    adminApi
      .list(tab === 'all' ? undefined : tab)
      .then((r) => setRequests(r.requests))
      .catch((e) => setErr(e.message));
  }, [tab]);

  function loadTeachers() {
    adminApi
      .teachers()
      .then((r) => setTeachers(r.teachers))
      .catch(() => undefined);
  }

  async function addTeacher(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    try {
      await adminApi.addTeacher(form);
      setMsg(`Teacher ${form.email} created. Share the email and password with them; they sign in at #/teacher/login.`);
      setForm({ email: '', name: '', password: '' });
      loadTeachers();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : 'Failed.');
    }
  }

  async function toggle(t: TeacherRow) {
    await adminApi.updateTeacher(t.id, { active: !t.active });
    loadTeachers();
  }

  async function resetPassword(t: TeacherRow) {
    const password = window.prompt(`New password for ${t.email} (min 8 characters):`);
    if (!password) return;
    try {
      await adminApi.updateTeacher(t.id, { password });
      setMsg(`Password updated for ${t.email}.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed.');
    }
  }

  if (fatal) {
    return (
      <div className="panel">
        <h2>Admin panel</h2>
        <p className="input-error">{fatal}</p>
        <p className="serif">
          Sign in with your VizuCode account first. Its email must be listed in <code>ADMIN_EMAILS</code> in the
          server's <code>.env</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="tp-wrap">
      <div className="tp-head">
        <div>
          <div className="eyebrow">Admin</div>
          <h1 className="page-title">Visualizer requests</h1>
          {info && (
            <p className="serif desc">
              AI: {info.ai ? info.model : 'GEMINI_API_KEY missing'} · Publishes to {info.github.repo}@{info.github.branch}
              {info.github.ready ? '' : ' (no GitHub token)'}
            </p>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="tp-tabs" style={{ marginBottom: '1rem' }}>
          {TABS.map((t) => (
            <button key={t} className={`btn${tab === t ? ' on' : ''}`} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        {requests === null ? (
          <p className="serif">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="serif">Nothing here.</p>
        ) : (
          <div className="tp-list">
            {requests.map((r) => (
              <Link className="tp-item" key={r.id} to={`/admin/request/${r.id}`}>
                <div>
                  <div className="t">
                    #{r.id} {r.title}
                  </div>
                  <div className="sub">
                    {r.category} · {r.teacher ? `${r.teacher.name} (${r.teacher.email})` : 'deleted teacher'} ·{' '}
                    {new Date(r.createdAt).toLocaleString()}
                    {r.alreadyOnSite ? ' · already on the site' : ''}
                  </div>
                </div>
                <div className="tp-row">
                  <span className={`tp-pill ${r.difficulty}`}>{r.difficulty}</span>
                  <span className={`tp-pill ${r.status}`}>{r.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Teachers</h2>
        <form onSubmit={addTeacher} className="tp-grid" style={{ alignItems: 'end' }}>
          <div className="tp-field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="tp-field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="tp-field">
            <label>Password (min 8)</label>
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="tp-field">
            <button className="btn primary" type="submit">
              Add teacher
            </button>
          </div>
        </form>
        {err && <p className="input-error">{err}</p>}
        {msg && <p className="tp-ok">{msg}</p>}
        <div className="tp-list">
          {teachers.map((t) => (
            <div className="tp-item" key={t.id}>
              <div>
                <div className="t">{t.name}</div>
                <div className="sub">
                  {t.email} · {t.requests} request{t.requests === 1 ? '' : 's'} · added{' '}
                  {new Date(t.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="tp-row">
                <span className={`tp-pill ${t.active ? 'published' : 'rejected'}`}>{t.active ? 'active' : 'disabled'}</span>
                <button className="btn" onClick={() => resetPassword(t)}>
                  Reset password
                </button>
                <button className="btn" onClick={() => toggle(t)}>
                  {t.active ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
