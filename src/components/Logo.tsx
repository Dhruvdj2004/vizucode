/**
 * The VizuCode mark: a "VC" monogram on a white disc — a dark V, an amber C with
 * code brackets knocked out of its bowl, and motion lines trailing off the left.
 *
 * Drawn as vector rather than cropped from the raster original so it stays sharp
 * at favicon size, and circular by construction so there are no square corners to
 * mask. The disc is an explicit white fill (not a theme token): it's the design's
 * background, and it reads on both light and dark headers.
 */

const AMBER = '#f5a02d';
const INK = '#1a1c20';

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="VizuCode"
      className="brand-mark"
    >
      <circle cx="50" cy="50" r="50" fill="#fff" />

      {/* Motion lines, longest through the middle, tapering above and below. */}
      <g stroke={AMBER} strokeWidth="3.2" strokeLinecap="round">
        <path d="M22 35.5 H31" />
        <path d="M15 42.5 H31" />
        <path d="M11 49.5 H29" />
        <path d="M15 56.5 H31" />
        <path d="M22 63.5 H31" />
      </g>
      <g fill={AMBER}>
        <circle cx="16.5" cy="35.5" r="1.8" />
        <circle cx="6" cy="49.5" r="1.8" />
        <circle cx="16.5" cy="63.5" r="1.8" />
      </g>

      {/* C first, then V over it — the V's right arm crosses the C's top-left. */}
      <path
        d="M82.6 38.6 A17 17 0 1 0 82.6 61.4"
        fill="none"
        stroke={AMBER}
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M28 30 L41 70 L54 30"
        fill="none"
        stroke={INK}
        strokeWidth="10"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* </> sitting in the C's bowl. */}
      <g fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M66 45 L61.5 50 L66 55" />
        <path d="M68.8 44 L72.6 56" />
        <path d="M75.5 45 L79.5 50 L75.5 55" />
      </g>
    </svg>
  );
}
