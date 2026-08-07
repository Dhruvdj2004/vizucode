import { useState } from 'react';

/**
 * Password input with a show/hide toggle, shared by the login and register forms.
 *
 * The toggle is type="button" so it never submits the form, and it carries an
 * aria-label rather than relying on the icon alone — the slash through the eye
 * means "currently visible, click to hide", which isn't obvious to a screen reader.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  hint?: string;
}) {
  const [shown, setShown] = useState(false);

  return (
    <div className="field auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? 'Hide password' : 'Show password'}
          aria-pressed={shown}
        >
          <svg
            viewBox="0 0 20 20"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M1.5 10S4.9 4.5 10 4.5 18.5 10 18.5 10 15.1 15.5 10 15.5 1.5 10 1.5 10Z" />
            <circle cx="10" cy="10" r="2.5" />
            {shown && <path d="M3.5 16.5 16.5 3.5" />}
          </svg>
        </button>
      </div>
      {hint && <span className="auth-hint">{hint}</span>}
    </div>
  );
}
