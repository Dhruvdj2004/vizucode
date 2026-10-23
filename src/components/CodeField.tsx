/** 6-digit email-code input used by sign-up, forgot password and college verification. */
export function CodeField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="field auth-field">
      <label htmlFor={id}>6-digit code</label>
      <input
        id={id}
        className="code-input mono"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="••••••"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        required
      />
    </div>
  );
}
