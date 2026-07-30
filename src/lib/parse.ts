// Input parsing helpers shared by problem definitions.

export function parseIntArray(s: string, opts?: { min?: number; max?: number; maxLen?: number }): number[] | string {
  const parts = s
    .replace(/[\[\]]/g, '')
    .split(/[,\s]+/)
    .filter((p) => p.length > 0);
  if (parts.length === 0) return 'Enter at least one number.';
  const maxLen = opts?.maxLen ?? 24;
  if (parts.length > maxLen) return `Keep it to at most ${maxLen} numbers so the steps stay readable.`;
  const out: number[] = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return `"${p}" is not an integer.`;
    if (opts?.min !== undefined && n < opts.min) return `Values must be ≥ ${opts.min}.`;
    if (opts?.max !== undefined && n > opts.max) return `Values must be ≤ ${opts.max}.`;
    out.push(n);
  }
  return out;
}

export function parseInt1(s: string, label: string, opts?: { min?: number; max?: number }): number | string {
  const n = Number(s.trim());
  if (!Number.isFinite(n) || !Number.isInteger(n)) return `${label} must be an integer.`;
  if (opts?.min !== undefined && n < opts.min) return `${label} must be ≥ ${opts.min}.`;
  if (opts?.max !== undefined && n > opts.max) return `${label} must be ≤ ${opts.max}.`;
  return n;
}

/** Parse "4,2,7,1,3,null,9" level-order into arrays; null = missing child. */
export function parseLevelOrder(s: string, maxNodes = 15): (number | null)[] | string {
  const parts = s
    .replace(/[\[\]]/g, '')
    .split(/[,\s]+/)
    .filter((p) => p.length > 0);
  if (parts.length === 0) return 'Enter at least one node.';
  const out: (number | null)[] = [];
  for (const p of parts) {
    if (p.toLowerCase() === 'null' || p === '-') out.push(null);
    else {
      const n = Number(p);
      if (!Number.isFinite(n) || !Number.isInteger(n)) return `"${p}" is not an integer or "null".`;
      out.push(n);
    }
  }
  if (out[0] === null) return 'Root cannot be null.';
  const count = out.filter((v) => v !== null).length;
  if (count > maxNodes) return `Keep it to at most ${maxNodes} nodes so the tree stays readable.`;
  return out;
}
