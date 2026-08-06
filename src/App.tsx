import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getSession, logout, onAuthChange } from './lib/auth';
import { Logo } from './components/Logo';

function getInitialTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem('vizucode-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [session, setSession] = useState(getSession);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // The visualizer list is the "/" section; every other nav entry owns a prefix.
  const section = pathname.startsWith('/dbms') ? 'dbms' : pathname.startsWith('/revision') ? 'revision' : 'dsa';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('vizucode-theme', theme);
  }, [theme]);

  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  return (
    <div className="container">
      <header className="site-header">
        <Link to="/" className="site-brand">
          <Logo size={30} />
          <span className="logo">
            Vizu<em>Code</em>
          </span>
          <span className="eyebrow faint">LeetCode, step by step</span>
        </Link>
        <nav className="site-nav" aria-label="Sections">
          <Link to="/" className={section === 'dsa' ? 'on' : ''}>
            DSA
          </Link>
          <Link to="/revision" className={section === 'revision' ? 'on' : ''}>
            Revision
          </Link>
          <Link to="/dbms" className={section === 'dbms' ? 'on' : ''}>
            DBMS
          </Link>
        </nav>
        <div className="header-actions">
          {session ? (
            <>
              <span className="auth-greeting">Hi, {session.user.firstName}</span>
              {!session.user.isPro && (
                <Link to="/upgrade" className="btn primary">
                  🔓 Upgrade
                </Link>
              )}
              <button
                className="btn"
                onClick={() => {
                  logout().then(() => navigate('/'));
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn">
              Sign in
            </Link>
          )}
          <button
            className="btn icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
