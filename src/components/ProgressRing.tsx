/** Donut ring showing solved/total, in the style of the reference design. */
export default function ProgressRing({ solved, total }: { solved: number; total: number }) {
  const pct = total > 0 ? solved / total : 0;
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg width={132} height={132} viewBox="0 0 120 120" role="img" aria-label={`${solved} of ${total} solved`}>
      <circle cx={60} cy={60} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={9} />
      <circle
        cx={60}
        cy={60}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={9}
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dasharray 400ms ease' }}
      />
      <text x={60} y={56} textAnchor="middle" fontSize={22} fontWeight={800} fill="var(--ink)" fontFamily="var(--font-mono)">
        {Math.round(pct * 100)}%
      </text>
      <text x={60} y={76} textAnchor="middle" fontSize={12} fill="var(--ink-soft)" fontFamily="var(--font-mono)">
        {solved} / {total}
      </text>
    </svg>
  );
}
