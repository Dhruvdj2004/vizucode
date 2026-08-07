// Renders Google's "Sign in with Google" button via Google Identity Services
// (loaded lazily, once, shared across mounts) and exchanges the resulting ID
// token with POST /api/auth/google (see googleLogin in ./auth). Renders
// nothing if VITE_GOOGLE_CLIENT_ID isn't set.
import { useEffect, useRef } from 'react';
import { googleLogin, DeviceLimitError, type DeviceSession } from './auth';

const SCRIPT_ID = 'google-identity-script';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

interface Props {
  onSuccess: () => void;
  onDeviceLimit: (sessions: DeviceSession[]) => void;
  onError: (message: string) => void;
}

export default function GoogleSignInButton({ onSuccess, onDeviceLimit, onError }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    function render() {
      if (cancelled || !divRef.current || !window.google) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID!,
        callback: async (response) => {
          try {
            await googleLogin(response.credential);
            onSuccess();
          } catch (err) {
            if (err instanceof DeviceLimitError) onDeviceLimit(err.sessions);
            else onError(err instanceof Error ? err.message : 'Something went wrong — try again.');
          }
        },
      });
      window.google.accounts.id.renderButton(divRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      });
    }

    if (window.google?.accounts?.id) {
      render();
      return;
    }
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', render);
    return () => {
      cancelled = true;
      script?.removeEventListener('load', render);
    };
  }, [onSuccess, onDeviceLimit, onError]);

  if (!CLIENT_ID) return null;

  return <div ref={divRef} className="google-signin-btn" />;
}
