import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getSession, onAuthChange } from './auth';

/** Redirects signed-out visitors to /login instead of rendering `children`. */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(getSession);
  useEffect(() => onAuthChange(() => setSession(getSession())), []);

  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
