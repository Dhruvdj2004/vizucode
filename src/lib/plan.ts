import type { AuthUser } from './auth';

// Free tier: only this category is fully open. Everything else needs
// isPro (set once Razorpay payment verification is wired in).
export const FREE_CATEGORY = 'Arrays & Hashing';

export function isCategoryLocked(category: string, user: AuthUser | undefined | null): boolean {
  if (user?.isPro) return false;
  return category !== FREE_CATEGORY;
}
