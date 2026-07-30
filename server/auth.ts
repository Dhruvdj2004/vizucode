// VizuCode auth module: register/login routes + JWT middleware.
// Validation with zod, password hashing with bcrypt. Users live in the
// `users` table when DATABASE_URL is set, otherwise in an in-memory map
// (dev fallback) — same routes and middleware either way.
import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db';

const JWT_SECRET = process.env.JWT_SECRET ?? 'vizucode-dev-secret-change-me';
if (!process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET not set — using the dev fallback. Set it in production.');
}
const TOKEN_TTL = '7d';
const BCRYPT_ROUNDS = 10;

// ---------- store ----------

interface User {
  id: number;
  email: string;
  firstName: string;
  passwordHash: string;
  isPro: boolean;
}

interface UserStore {
  findByEmail(email: string): Promise<User | undefined>;
  /** Returns null when the email is already taken. */
  create(email: string, firstName: string, passwordHash: string): Promise<User | null>;
  /** Flips isPro to true (post payment-verification). Returns undefined if the id is unknown. */
  markPro(id: number): Promise<User | undefined>;
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
  user?: { id: number; email: string; firstName: string; isPro: boolean };
}

/** Rejects the request unless it carries a valid `Authorization: Bearer <token>`. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) {
    res.status(401).json({ error: 'Sign in to continue.' });
    return;
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
      firstName: string;
      isPro: boolean;
    };
    req.user = {
      id: Number(payload.sub),
      email: payload.email,
      firstName: payload.firstName,
      isPro: !!payload.isPro,
    };
    next();
  } catch {
    res.status(401).json({ error: 'Session expired — sign in again.' });
  }
}

function signToken(user: User): string {
  return jwt.sign({ email: user.email, firstName: user.firstName, isPro: user.isPro }, JWT_SECRET, {
    subject: String(user.id),
    expiresIn: TOKEN_TTL,
  });
}

function publicUser(user: User) {
  return { id: user.id, email: user.email, firstName: user.firstName, isPro: user.isPro };
}

export type PublicUser = ReturnType<typeof publicUser>;

/** Flips a user to isPro and issues a fresh token carrying it — used after payment verification. */
export async function markUserPro(id: number): Promise<{ token: string; user: PublicUser } | undefined> {
  const user = await store.markPro(id);
  if (!user) return undefined;
  return { token: signToken(user), user: publicUser(user) };
}

// ---------- routes ----------

export const authRouter = Router();

/** Express 4 doesn't route async rejections to the error handler on its own. */
const wrap =
  (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
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
  const user = await store.create(email, firstName, passwordHash);
  if (!user) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

/** POST /api/auth/login — body: { email, password } */
authRouter.post('/login', wrap(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: firstIssue(parsed.error) });
    return;
  }
  const { email, password } = parsed.data;
  const user = await store.findByEmail(email);
  // Same message for unknown email and wrong password, so the endpoint
  // doesn't reveal which emails are registered.
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    res.status(401).json({ error: 'Incorrect email or password.' });
    return;
  }
  res.json({ token: signToken(user), user: publicUser(user) });
}));

/** GET /api/auth/me — requires a valid token; returns the signed-in user. */
authRouter.get('/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});
