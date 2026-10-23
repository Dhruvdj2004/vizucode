// One-time 6-digit codes sent by email. Used for three things:
//   'register' — a new @ietdavv.edu.in account proves it owns the address
//                before it is created (and made Pro);
//   'reset'    — forgot password;
//   'college'  — an existing @ietdavv.edu.in account proves ownership to get Pro.
// Only an HMAC of the code is stored. Codes expire after CODE_TTL_MS, allow
// MAX_ATTEMPTS wrong guesses, and can't be re-sent within RESEND_COOLDOWN_MS.
//
// Delivery: SMTP when SMTP_HOST is set (e.g. Gmail with an app password).
// Without SMTP, a local server prints the code to its console instead; on
// Vercel that fallback is off and sending fails with a clear error.
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { pool } from './db';

export type CodePurpose = 'register' | 'reset' | 'college';

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const SECRET = process.env.JWT_SECRET ?? 'vizucode-dev-secret-change-me';

export class CodeError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function hashCode(email: string, purpose: CodePurpose, code: string): string {
  return crypto.createHmac('sha256', SECRET).update(`${purpose}:${email}:${code}`).digest('hex');
}

interface Row {
  codeHash: string;
  data: unknown;
  attempts: number;
  expiresAt: number;
  createdAt: number;
}

interface CodeStore {
  get(email: string, purpose: CodePurpose): Promise<Row | undefined>;
  put(email: string, purpose: CodePurpose, row: Row): Promise<void>;
  bumpAttempts(email: string, purpose: CodePurpose): Promise<void>;
  remove(email: string, purpose: CodePurpose): Promise<void>;
}

const mem = new Map<string, Row>();
const key = (email: string, purpose: string) => `${purpose}:${email}`;

const db = pool;
const store: CodeStore = db
  ? {
      async get(email, purpose) {
        const r = await db.query(
          'select code_hash, data, attempts, expires_at, created_at from email_codes where email = $1 and purpose = $2',
          [email, purpose]
        );
        const row = r.rows[0];
        return row
          ? {
              codeHash: row.code_hash,
              data: row.data,
              attempts: row.attempts,
              expiresAt: (row.expires_at as Date).getTime(),
              createdAt: (row.created_at as Date).getTime(),
            }
          : undefined;
      },
      async put(email, purpose, row) {
        await db.query(
          `insert into email_codes (email, purpose, code_hash, data, attempts, expires_at, created_at)
           values ($1, $2, $3, $4, 0, $5, $6)
           on conflict (email, purpose) do update
             set code_hash = excluded.code_hash, data = excluded.data, attempts = 0,
                 expires_at = excluded.expires_at, created_at = excluded.created_at`,
          [email, purpose, row.codeHash, JSON.stringify(row.data ?? null), new Date(row.expiresAt), new Date(row.createdAt)]
        );
      },
      async bumpAttempts(email, purpose) {
        await db.query('update email_codes set attempts = attempts + 1 where email = $1 and purpose = $2', [email, purpose]);
      },
      async remove(email, purpose) {
        await db.query('delete from email_codes where email = $1 and purpose = $2', [email, purpose]);
      },
    }
  : {
      async get(email, purpose) {
        return mem.get(key(email, purpose));
      },
      async put(email, purpose, row) {
        mem.set(key(email, purpose), row);
      },
      async bumpAttempts(email, purpose) {
        const row = mem.get(key(email, purpose));
        if (row) row.attempts++;
      },
      async remove(email, purpose) {
        mem.delete(key(email, purpose));
      },
    };

// ---------- sending ----------

const SMTP_HOST = process.env.SMTP_HOST;
const mailer = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 465),
      secure: Number(process.env.SMTP_PORT ?? 465) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;
const MAIL_FROM = process.env.MAIL_FROM ?? (process.env.SMTP_USER ? `VizuCode <${process.env.SMTP_USER}>` : 'VizuCode');

const SUBJECT: Record<CodePurpose, string> = {
  register: 'Your VizuCode sign-up code',
  reset: 'Reset your VizuCode password',
  college: 'Verify your college email on VizuCode',
};
const LINE: Record<CodePurpose, string> = {
  register: 'Use this code to finish creating your VizuCode account:',
  reset: 'Use this code to set a new VizuCode password:',
  college: 'Use this code to verify your college email and unlock VizuCode Pro:',
};

async function deliver(email: string, purpose: CodePurpose, code: string): Promise<void> {
  if (mailer) {
    await mailer.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: SUBJECT[purpose],
      text: `${LINE[purpose]}\n\n${code}\n\nIt expires in 10 minutes. If you didn't ask for this, ignore this email.`,
      html: `<p>${LINE[purpose]}</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p style="color:#666">It expires in 10 minutes. If you didn't ask for this, ignore this email.</p>`,
    });
    return;
  }
  if (process.env.VERCEL) {
    throw new CodeError('Email sending is not set up on the server yet.', 500);
  }
  // Local dev: no SMTP configured, so show the code in the server console.
  console.log(`[email-code] ${purpose} code for ${email}: ${code}`);
}

// ---------- API ----------

/** Creates (or replaces) the code for this email + purpose and emails it. `data` is returned by verifyCode. */
export async function sendCode(email: string, purpose: CodePurpose, data?: unknown): Promise<void> {
  const existing = await store.get(email, purpose);
  if (existing && Date.now() - existing.createdAt < RESEND_COOLDOWN_MS) {
    const wait = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - existing.createdAt)) / 1000);
    throw new CodeError(`Please wait ${wait}s before asking for a new code.`, 429);
  }
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  const now = Date.now();
  await store.put(email, purpose, { codeHash: hashCode(email, purpose, code), data, attempts: 0, expiresAt: now + CODE_TTL_MS, createdAt: now });
  try {
    await deliver(email, purpose, code);
  } catch (e) {
    await store.remove(email, purpose);
    if (e instanceof CodeError) throw e;
    console.error('[email-code] send failed:', e);
    throw new CodeError('Could not send the email — try again in a minute.', 502);
  }
}

/** Checks the code; on success deletes it and returns the data stored with it. Throws CodeError otherwise. */
export async function verifyCode(email: string, purpose: CodePurpose, code: string): Promise<unknown> {
  const row = await store.get(email, purpose);
  if (!row || row.expiresAt < Date.now()) {
    if (row) await store.remove(email, purpose);
    throw new CodeError('That code has expired — ask for a new one.');
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await store.remove(email, purpose);
    throw new CodeError('Too many wrong tries — ask for a new code.');
  }
  const given = Buffer.from(hashCode(email, purpose, code.trim()));
  const want = Buffer.from(row.codeHash);
  if (given.length !== want.length || !crypto.timingSafeEqual(given, want)) {
    await store.bumpAttempts(email, purpose);
    throw new CodeError('That code is not right — check your email and try again.');
  }
  await store.remove(email, purpose);
  return row.data;
}
