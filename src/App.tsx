import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getSession, logout, onAuthChange } from './lib/auth';
import { navSection } from './content/navKeys';
import { Logo } from './components/Logo';
import InterviewerBot from './pages/interview/InterviewerBot';
import { Icon } from './components/Icon';
import { RESUME_READY } from './lib/resume';
import { canSeeCodeCatalyst } from './lib/codeCatalyst';

const INSTAGRAM_URL = 'https://www.instagram.com/vizucode26/';

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function getInitialTheme(): 'light' | 'dark' {
  const saved = localStorage.getItem('vizucode-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [session, setSession] = useState(getSession);
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  // Which nav entry lights up — the module registry owns that mapping, so a new
  // core subject does not need this file changed.
  const section = navSection(pathname, state);

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
          <span className="eyebrow faint">Lets code</span>
        </Link>
        <nav className="site-nav" aria-label="Sections">
          <Link to="/" className={section === 'home' ? 'on' : ''}>
            Home
          </Link>
          <Link to="/dsa" className={section === 'dsa' ? 'on' : ''}>
            DSA
          </Link>
          {canSeeCodeCatalyst(session?.user) && (
            <Link to="/code-catalyst" className={section === 'catalyst' ? 'on' : ''}>
              Code Catalyst
            </Link>
          )}
          <Link to="/revision" className={section === 'revision' ? 'on' : ''}>
            Revision
          </Link>
          <Link to="/core" className={section === 'core' ? 'on' : ''}>
            Core Subjects
          </Link>
          <Link to="/aptitude" className={section === 'aptitude' ? 'on' : ''}>
            Aptitude
          </Link>
          <Link to="/resume" className={section === 'resume' ? 'on' : ''}>
            Resume{!RESUME_READY && <span className="nav-soon">soon</span>}
          </Link>
          <Link to="/news" className={section === 'news' ? 'on' : ''}>
            AI News
          </Link>
          <Link to="/feedback" className={pathname === '/feedback' ? 'on' : ''}>
            Feedback
          </Link>
        </nav>
        <div className="header-actions">
          <Link
            to="/interview"
            className={`iv-launch ${section === 'interview' ? 'on' : ''}`}
            aria-current={section === 'interview' ? 'page' : undefined}
          >
            <span className="iv-launch-bot" aria-hidden>
              <InterviewerBot mood="idle" size={30} showStatus={false} />
            </span>
            AI Interview
          </Link>
          {session ? (
            <>
              <span className="auth-greeting">Hi, {session.user.firstName}</span>
              {!session.user.isPro && (
                <Link to="/upgrade" className="btn primary">
                  <Icon name="unlock" /> Upgrade
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
          <a
            className="btn icon"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="VizuCode on Instagram"
            title="Follow @vizucode26 on Instagram"
          >
            <InstagramIcon />
          </a>
          <button
            className="btn icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        </div>
      </header>
      <Outlet />
      <footer className="site-footer">
        <span className="faint">© {new Date().getFullYear()} VizuCode</span>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="footer-social">
          <InstagramIcon size={15} />
          <span>Follow us on Instagram @vizucode26</span>
        </a>
      </footer>
    </div>
  );
}
