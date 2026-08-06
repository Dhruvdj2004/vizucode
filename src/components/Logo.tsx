/**
 * The VizuCode mark: code brackets framing a small graph, i.e. "seeing the code".
 * Brackets ride on currentColor so the mark inherits whatever ink the header uses;
 * the nodes and edges pull the accent tokens so both themes are covered.
 */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-label="VizuCode"
      className="brand-mark"
    >
      <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round">
        <path d="M8 32 A26 26 0 0 1 35.17 16.19" />
        <path d="M41.32 17.73 A26 26 0 0 1 56 32" />
        <path d="M56 32 A26 26 0 0 1 28.83 47.81" />
        <path d="M22.68 46.27 A26 26 0 0 1 8 32" />
      </g>
      <g fill="none" stroke="var(--accent-2)" strokeWidth="2.4" strokeLinecap="round">
        <path d="M24 32 L37.5 25.5" />
        <path d="M37.5 25.5 L36.5 39.5" />
        <path d="M36.5 39.5 L24 32" />
      </g>
      <g fill="var(--accent)">
        <circle cx="24" cy="32" r="3.6" />
        <circle cx="37.5" cy="25.5" r="3.6" />
        <circle cx="36.5" cy="39.5" r="3.6" />
      </g>
    </svg>
  );
}
