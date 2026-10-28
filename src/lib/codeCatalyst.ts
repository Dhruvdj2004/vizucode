import type { AuthUser } from './auth';

// Kept free of question data: the site header imports this on every page.
//
// Who can see the Code Catalyst section: only accounts signed in with an
// IET DAVV college email (@ietdavv.edu.in). This is the ONLY place that
// decides it — the nav link, the #/code-catalyst page and the visualizer page
// all ask canSeeCodeCatalyst().
const ALLOWED_DOMAIN = '@ietdavv.edu.in';

export function canSeeCodeCatalyst(user: AuthUser | undefined | null): boolean {
  if (!user?.email) return false;
  return user.email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN);
}
