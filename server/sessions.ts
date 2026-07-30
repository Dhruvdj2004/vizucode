// Device-session tracking: caps concurrent logins per account at MAX_DEVICES.
// Sessions live in the `user_sessions` table when DATABASE_URL is set,
// otherwise an in-memory map (dev fallback) — same shape either way.
import { randomUUID } from 'node:crypto';
import { pool } from './db';

export const MAX_DEVICES = 2;

export interface DeviceSession {
  id: string;
  label: string;
  createdAt: string; // ISO
}

interface SessionStore {
  list(userId: number): Promise<DeviceSession[]>;
  create(userId: number, label: string): Promise<DeviceSession>;
  revoke(userId: number, sessionId: string): Promise<void>;
  exists(userId: number, sessionId: string): Promise<boolean>;
}

const memSessions = new Map<number, DeviceSession[]>();

const db = pool;
export const sessionStore: SessionStore = db
  ? {
      async list(userId) {
        const r = await db.query(
          'select id, label, created_at from user_sessions where user_id = $1 order by created_at asc',
          [userId]
        );
        return r.rows.map((row: { id: string; label: string; created_at: Date }) => ({
          id: row.id,
          label: row.label,
          createdAt: row.created_at.toISOString(),
        }));
      },
      async create(userId, label) {
        const id = randomUUID();
        const r = await db.query(
          'insert into user_sessions (id, user_id, label) values ($1, $2, $3) returning created_at',
          [id, userId, label]
        );
        return { id, label, createdAt: (r.rows[0].created_at as Date).toISOString() };
      },
      async revoke(userId, sessionId) {
        await db.query('delete from user_sessions where id = $1 and user_id = $2', [sessionId, userId]);
      },
      async exists(userId, sessionId) {
        const r = await db.query('select 1 from user_sessions where id = $1 and user_id = $2', [sessionId, userId]);
        return (r.rowCount ?? 0) > 0;
      },
    }
  : {
      async list(userId) {
        return memSessions.get(userId) ?? [];
      },
      async create(userId, label) {
        const session: DeviceSession = { id: randomUUID(), label, createdAt: new Date().toISOString() };
        const list = memSessions.get(userId) ?? [];
        list.push(session);
        memSessions.set(userId, list);
        return session;
      },
      async revoke(userId, sessionId) {
        const list = memSessions.get(userId);
        if (list) memSessions.set(userId, list.filter((s) => s.id !== sessionId));
      },
      async exists(userId, sessionId) {
        return !!memSessions.get(userId)?.some((s) => s.id === sessionId);
      },
    };

/** Lightweight User-Agent sniff — enough to tell devices apart, no parsing library needed. */
export function deviceLabel(userAgent: string | undefined): string {
  const ua = userAgent ?? '';
  let os = 'Unknown device';
  if (/ipad/i.test(ua)) os = 'iPad';
  else if (/iphone/i.test(ua)) os = 'iPhone';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/mac os x/i.test(ua)) os = 'Mac';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/linux/i.test(ua)) os = 'Linux';

  let browser = '';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = 'Chrome';
  else if (/firefox\//i.test(ua)) browser = 'Firefox';
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = 'Safari';

  return browser ? `${os} · ${browser}` : os;
}
