// VizuCode auth module: register/login routes + JWT middleware.
// Validation with zod, password hashing with bcrypt. Users live in the
// `users` table when DATABASE_URL is set, otherwise in an in-memory map
// (dev fallback) — same routes and middleware either way.
import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { pool } from './db';
import { sessionStore, deviceLabel, MAX_DEVICES } from './sessions';
import { sendCode, verifyCode, CodeError } from './emailCodes';

const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const JWT_SECRET = process.env.JWT_SECRET ?? 'vizucode-dev-secret-change-me';
if (!process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET not set — using the dev fallback. Set it in production.');
}
const FREE_PRO_EMAIL_SUFFIX = '@ietdavv.edu.in';

/** IET DAVV accounts get everything free (Pro, no payments) once the address is verified. */
export function isCollegeEmail(email: string): boolean {
  return email.toLowerCase().endsWith(FREE_PRO_EMAIL_SUFFIX);
}
const TOKEN_TTL = '7d';
const BCRYPT_ROUNDS = 10;

// ---------- store ----------

interface User {
  id: number;
  email: string;
  firstName: string;
  passwordHash: string | null;
  isPro: boolean;
}

interface UserStore {
  findByEmail(email: string): Promise<User | undefined>;
  /** Returns null when the email is already taken. */
  create(email: string, firstName: string, passwordHash: string): Promise<User | null>;
  /** Flips isPro to true (post payment-verification). Returns undefined if the id is unknown. */
  markPro(id: number): Promise<User | undefined>;
  /**
   * Finds the user for a verified Google account by email, linking the
   * google_id if the account existed with a password only. Creates a new
   * (password-less) account if none existed.
   */
  findOrCreateGoogle(email: string, firstName: string, googleId: string): Promise<User>;
  setPassword(id: number, passwordHash: string): Promise<void>;
}

const memUsers = new Map<string, User>();
let nextId = 1;

const db = pool;
const store: UserStore = db
  ? {
      async findByEmail(email) {
        const r = await db.query(
          'select id, email, first_name, password_hash, is_pro from users where email = $1',
          [email]
        );
        const row = r.rows[0];
        return row
          ? {
              id: row.id,
              email: row.email,
              firstName: row.first_name,
              passwordHash: row.password_hash,
              isPro: row.is_pro,
            }
          : undefined;
      },
      async create(email, firstName, passwordHash) {
        try {
          const r = await db.query(
            'insert into users (email, first_name, password_hash) values ($1, $2, $3) returning id',
            [email, firstName, passwordHash]
          );
          return { id: r.rows[0].id, email, firstName, passwordHash, isPro: false };
        } catch (e) {
          if ((e as { code?: string }).code === '23505') return null; // unique_violation
          throw e;
        }
      },
      async markPro(id) {
        const r = await db.query(
          'update users set is_pro = true where id = $1 returning email, first_name, password_hash',
          [id]
        );
        const row = r.rows[0];
        return row
          ? { id, email: row.email, firstName: row.first_name, passwordHash: row.password_hash, isPro: true }
          : undefined;
      },
      async findOrCreateGoogle(email, firstName, googleId) {
        const existing = await db.query(
          'select id, email, first_name, password_hash, is_pro from users where email = $1',
          [email]
        );
        const row = existing.rows[0];
        if (row) {
          await db.query('update users set google_id = $1 where id = $2 and google_id is null', [googleId, row.id]);
          return {
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            passwordHash: row.password_hash,
            isPro: row.is_pro,
          };
        }
        const r = await db.query(
          'insert into users (email, first_name, google_id) values ($1, $2, $3) returning id',
          [email, firstName, googleId]
        );
        return { id: r.rows[0].id, email, firstName, passwordHash: null, isPro: false };
      },
      async setPassword(id, passwordHash) {
        await db.query('update users set password_hash = $1 where id = $2', [passwordHash, id]);
      },
    }
  : {
      async findByEmail(email) {
        return memUsers.get(email);
      },
      async create(email, firstName, passwordHash) {
        if (memUsers.has(email)) return null;
        const user: User = { id: nextId++, email, firstName, passwordHash, isPro: false };
        memUsers.set(email, user);
        return user;
      },
      async markPro(id) {
        const user = [...memUsers.values()].find((u) => u.id === id);
        if (user) user.isPro = true;
        return user;
      },
      async findOrCreateGoogle(email, firstName, googleId) {
        const existing = memUsers.get(email);
        if (existing) return existing;
        const user: User = { id: nextId++, email, firstName, passwordHash: null, isPro: false };
        memUsers.set(email, user);
        void googleId; // not tracked in the dev in-memory store
        return user;
      },
      async setPassword(id, passwordHash) {
        const user = [...memUsers.values()].find((u) => u.id === id);
        if (user) user.passwordHash = passwordHash;
      },
    };

// ---------- zod schemas ----------

const emailSchema = z
  .string({ error: 'Email is required.' })
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.')
  .max(120);
const passwordSchema = z
  .string({ error: 'Password is required.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be at most 72 characters.'); // bcrypt input limit

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string({ error: 'First name is required.' }).trim().min(1, 'First name is required.').max(60),
});

const codeSchema = z
  .string({ error: 'Enter the 6-digit code.' })
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit code from the email.');

const verifyRegisterSchema = z.object({ email: emailSchema, code: codeSchema });
const forgotSchema = z.object({ email: emailSchema });
const resetSchema = z.object({ email: emailSchema, code: codeSchema, password: passwordSchema });
const collegeVerifySchema = z.object({ code: codeSchema });

const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: 'Password is required.' }).min(1, 'Password is required.').max(72),
});

/** First zod issue as a single human-readable message. */
function firstIssue(err: z.ZodError): string {
  const issue = err.issues[0];
  return issue ? issue.message : 'Invalid input.';
}

// ---------- JWT middleware ----------

export interface AuthedRequest extends Request {
  user?: { id: number; email: string; firstName: string; isPro: boolean; sid: string };
}

/**
 * Rejects the request unless it carries a valid `Authorization: Bearer <token>`
 * whose session hasn't been signed out elsewhere (see server/sessions.ts —
 * this is what makes the max-2-device limit actually enforceable, not just
 * advisory: a revoked session's token stops working immediately, not just
 * at its 7-day expiry).
 */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) {
    res.status(401).json({ error: 'Sign in to continue.' });
    return;
  }
  let payload: { sub: string; email: string; firstName: string; isPro: boolean; sid: string };
  try {
    payload = jwt.verify(token, JWT_SECRET) as typeof payload;
  } catch {
    res.status(401).json({ error: 'Session expired — sign in again.' });
    return;
  }
  const userId = Number(payload.sub);
  try {
    if (!(await sessionStore.exists(userId, payload.sid))) {
      res.status(401).json({ error: 'You were signed out on this device.' });
      return;
    }
  } catch (e) {
    console.error('[auth] session lookup failed:', e);
    res.status(500).json({ error: 'Internal error.' });
    return;
  }
  req.user = { id: userId, email: payload.email, firstName: payload.firstName, isPro: !!payload.isPro, sid: payload.sid };
  next();
}

function signToken(user: User, sessionId: string): string {
  return jwt.sign({ email: user.email, firstName: user.firstName, isPro: user.isPro, sid: sessionId }, JWT_SECRET, {
    subject: String(user.id),
    expiresIn: TOKEN_TTL,
  });
}

function publicUser(user: User) {
  return { id: user.id, email: user.email, firstName: user.firstName, isPro: user.isPro };
}

export type PublicUser = ReturnType<typeof publicUser>;

/** Flips a user to isPro and issues a fresh token carrying it — used after payment verification. */
export async function markUserPro(
  id: number,
  sessionId: string
): Promise<{ token: string; user: PublicUser } | undefined> {
  const user = await store.markPro(id);
  if (!user) return undefined;
  return { token: signToken(user, sessionId), user: publicUser(user) };
}

// ---------- routes ----------

export const authRouter = Router();

/** Express 4 doesn't route async rejections to the error handler on its own. */
const wrap =
  (fn: (req: AuthedRequest, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req as AuthedRequest, res).catch((e) => {
      if (e instanceof CodeError) res.status(e.status).json({ error: e.message });
      else next(e);
    });
  };

/** POST /api/auth/register — body: { email, password, firstName } */
authRouter.post('/register', wrap(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { email, password, firstName } = parsed.data;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  // College accounts become Pro, so the address must be proven first: email a
  // code and create the account only in /register/verify.
  if (isCollegeEmail(email)) {
    if (await store.findByEmail(email)) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    await sendCode(email, 'register', { passwordHash, firstName });
    res.status(202).json({ verify: true, email });
    return;
  }
  const user = await store.create(email, firstName, passwordHash);
  if (!user) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }
  const session = await sessionStore.create(user.id, deviceLabel(req.headers['user-agent']));
  res.status(201).json({ token: signToken(user, session.id), user: publicUser(user) });
}));

/** POST /api/auth/register/verify — body: { email, code }. Creates the college account (as Pro) after the emailed code checks out. */
authRouter.post('/register/verify', wrap(async (req, res) => {
  const parsed = verifyRegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { email, code } = parsed.data;
  const pending = (await verifyCode(email, 'register', code)) as { passwordHash: string; firstName: string } | null;
  if (!pending?.passwordHash) {
    res.status(400).json({ error: 'That code has expired — sign up again.' });
    return;
  }
  const created = await store.create(email, pending.firstName, pending.passwordHash);
  if (!created) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }
  const user = (await store.markPro(created.id)) ?? created;
  const session = await sessionStore.create(user.id, deviceLabel(req.headers['user-agent']));
  res.status(201).json({ token: signToken(user, session.id), user: publicUser(user) });
}));

/**
 * POST /api/auth/password/forgot — body: { email }. Emails a reset code if the
 * account exists. Always answers the same way so it can't be used to find out
 * which emails are registered.
 */
authRouter.post('/password/forgot', wrap(async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { email } = parsed.data;
  if (await store.findByEmail(email)) {
    try {
      await sendCode(email, 'reset');
    } catch (e) {
      // A cooldown hit would reveal the account exists; answer as usual.
      if (!(e instanceof CodeError) || e.status !== 429) throw e;
    }
  }
  res.json({ ok: true });
}));

/** POST /api/auth/password/reset — body: { email, code, password }. Sets the new password and signs out every device. */
authRouter.post('/password/reset', wrap(async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { email, code, password } = parsed.data;
  await verifyCode(email, 'reset', code);
  const user = await store.findByEmail(email);
  if (!user) {
    res.status(400).json({ error: 'That code has expired — ask for a new one.' });
    return;
  }
  await store.setPassword(user.id, await bcrypt.hash(password, BCRYPT_ROUNDS));
  await sessionStore.revokeAll(user.id);
  // The code proved they own the inbox, which is all a college upgrade needs.
  if (!user.isPro && isCollegeEmail(email)) await store.markPro(user.id);
  res.json({ ok: true });
}));

/** POST /api/auth/college/send — signed in, @ietdavv.edu.in, not Pro yet: emails a code to prove the address. */
authRouter.post('/college/send', requireAuth, wrap(async (req, res) => {
  const { email, isPro } = req.user!;
  if (!isCollegeEmail(email)) {
    res.status(400).json({ error: 'Only @ietdavv.edu.in accounts can do this.' });
    return;
  }
  if (isPro) {
    res.status(400).json({ error: "You're already Pro." });
    return;
  }
  await sendCode(email.toLowerCase(), 'college');
  res.json({ ok: true });
}));

/** POST /api/auth/college/verify — body: { code }. Marks the account Pro and returns a fresh token. */
authRouter.post('/college/verify', requireAuth, wrap(async (req, res) => {
  const parsed = collegeVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { id, email, sid } = req.user!;
  if (!isCollegeEmail(email)) {
    res.status(400).json({ error: 'Only @ietdavv.edu.in accounts can do this.' });
    return;
  }
  await verifyCode(email.toLowerCase(), 'college', parsed.data.code);
  const fresh = await markUserPro(id, sid);
  if (!fresh) {
    res.status(404).json({ error: 'Account not found.' });
    return;
  }
  res.json(fresh);
}));

/** POST /api/auth/login — body: { email, password }. 409s with the device list if already at MAX_DEVICES. */
authRouter.post('/login', wrap(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { email, password } = parsed.data;
  const user = await store.findByEmail(email);
  // Same message for unknown email and wrong password, so the endpoint
  // doesn't reveal which emails are registered. Google-only accounts have no
  // passwordHash, so they always fail password login (as intended).
  const ok = user?.passwordHash && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    res.status(401).json({ error: 'Incorrect email or password.' });
    return;
  }
  const sessions = await sessionStore.list(user.id);
  if (sessions.length >= MAX_DEVICES) {
    res.status(409).json({
      error: `You're already signed in on ${MAX_DEVICES} devices — sign out of one to continue.`,
      sessions,
    });
    return;
  }
  const session = await sessionStore.create(user.id, deviceLabel(req.headers['user-agent']));
  res.json({ token: signToken(user, session.id), user: publicUser(user) });
}));

const forceLoginSchema = z.object({
  email: emailSchema,
  password: z.string({ error: 'Password is required.' }).min(1, 'Password is required.').max(72),
  revokeSessionId: z.string({ error: 'Missing session to sign out.' }).min(1),
});

const googleSchema = z.object({
  credential: z.string({ error: 'Missing Google credential.' }).min(1),
});

/**
 * POST /api/auth/google — body: { credential } (the ID token from Google
 * Identity Services). Verifies it against Google's servers, then finds or
 * creates the account by email. Subject to the same MAX_DEVICES cap as
 * password login (returns the same device-list 409 for the frontend to
 * offer force-login on).
 */
authRouter.post('/google', wrap(async (req, res) => {
  if (!googleClient) {
    res.status(500).json({ error: 'Google sign-in is not configured on this server.' });
    return;
  }
  const parsed = googleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  let payload: { email?: string; email_verified?: boolean; given_name?: string; name?: string; sub: string };
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.credential,
      audience: GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload() as typeof payload;
  } catch {
    res.status(401).json({ error: 'Could not verify Google sign-in — try again.' });
    return;
  }
  if (!payload?.email || !payload.email_verified) {
    res.status(401).json({ error: 'Your Google account has no verified email.' });
    return;
  }
  const email = payload.email.toLowerCase();
  const firstName = payload.given_name || payload.name || 'there';
  let user = await store.findOrCreateGoogle(email, firstName, payload.sub);
  // College accounts get Pro for free. Granted only here, never on password
  // register/login: Google has verified the address, whereas anyone can type
  // a college email into the sign-up form.
  if (!user.isPro && isCollegeEmail(email)) {
    user = (await store.markPro(user.id)) ?? user;
  }
  const sessions = await sessionStore.list(user.id);
  if (sessions.length >= MAX_DEVICES) {
    res.status(409).json({
      error: `You're already signed in on ${MAX_DEVICES} devices — sign out of one to continue.`,
      sessions,
    });
    return;
  }
  const session = await sessionStore.create(user.id, deviceLabel(req.headers['user-agent']));
  res.json({ token: signToken(user, session.id), user: publicUser(user) });
}));

/**
 * POST /api/auth/login/force — body: { email, password, revokeSessionId }.
 * Re-verifies the password (the caller has no session token yet, since the
 * plain /login above rejected them for being at the device limit), signs
 * the named device out, and logs the caller in on this one.
 */
authRouter.post('/login/force', wrap(async (req, res) => {
  const parsed = forceLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { email, password, revokeSessionId } = parsed.data;
  const user = await store.findByEmail(email);
  const ok = user?.passwordHash && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    res.status(401).json({ error: 'Incorrect email or password.' });
    return;
  }
  await sessionStore.revoke(user.id, revokeSessionId);
  const session = await sessionStore.create(user.id, deviceLabel(req.headers['user-agent']));
  res.json({ token: signToken(user, session.id), user: publicUser(user) });
}));

/** POST /api/auth/logout — requires a valid token; revokes this device's session server-side. */
authRouter.post('/logout', requireAuth, wrap(async (req, res) => {
  await sessionStore.revoke(req.user!.id, req.user!.sid);
  res.json({ ok: true });
}));

/** GET /api/auth/me — requires a valid token; returns the signed-in user. */
authRouter.get('/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});
