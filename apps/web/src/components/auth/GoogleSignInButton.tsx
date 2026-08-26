import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserType } from "@/context/AuthContext";
import { toast } from "sonner";

/**
 * Google Sign-In, rendered by Google Identity Services.
 *
 * GIS hands us an ID token in the callback; the backend verifies it against
 * Google (audience-checked) and issues our own session, so nothing here is
 * trusted client-side. The script is loaded on demand rather than in index.html
 * so pages that never show a login form don't pay for it.
 *
 * Renders nothing when VITE_GOOGLE_CLIENT_ID is unset — a dead Google button is
 * worse than no button.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GIS_SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

/** Load the GIS script once, even if several buttons mount. */
let gisPromise: Promise<void> | null = null;
const loadGis = (): Promise<void> => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisPromise) return gisPromise;

  gisPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Sign-In")));
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });

  return gisPromise;
};

interface GoogleSignInButtonProps {
  /** Applied only when this sign-in creates a new account. */
  userType?: UserType;
  onSuccess?: (result: { isNewUser: boolean }) => void;
}

const GoogleSignInButton = ({ userType, onSuccess }: GoogleSignInButtonProps) => {
  const target = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);
  const { loginWithGoogle } = useAuth();

  // Callbacks fire from Google's own code, so read the latest props via a ref
  // rather than re-initialising GIS on every render.
  const handler = useRef<(credential: string) => void>();
  handler.current = async (credential: string) => {
    try {
      const result = await loginWithGoogle(credential, userType);
      onSuccess?.(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed");
    }
  };

  useEffect(() => {
    if (!CLIENT_ID) {
      setUnavailable(true);
      return;
    }

    let cancelled = false;
    loadGis()
      .then(() => {
        if (cancelled || !target.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => handler.current?.(response.credential),
          cancel_on_tap_outside: true,
        });
        window.google.accounts.id.renderButton(target.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "center",
          width: target.current.offsetWidth || 320,
        });
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!CLIENT_ID || unavailable) return null;

  return <div ref={target} className="flex w-full justify-center" />;
};

export default GoogleSignInButton;
