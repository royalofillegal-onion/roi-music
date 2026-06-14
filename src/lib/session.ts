// Roi ID session management — stores token in localStorage and provides
// helpers + a React hook for the current user.
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const TOKEN_KEY = "roi_session";
const USER_KEY = "roi_user";

export interface RoiUser {
  id: string;
  app_id: string;
  display_name?: string | null;
  created_at?: string;
}

export interface SessionState {
  token: string | null;
  user: RoiUser | null;
  isAdmin: boolean;
  loading: boolean;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCachedUser(): RoiUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem("roi_is_admin");
  window.dispatchEvent(new Event("roi-session"));
}

export function saveSession(token: string, user: RoiUser, isAdmin: boolean) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem("roi_is_admin", isAdmin ? "1" : "0");
  window.dispatchEvent(new Event("roi-session"));
}

export async function invokeFn<T = any>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw error;
  return data as T;
}

/** Subscribes to session changes (login / logout). */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>(() => ({
    token: getToken(),
    user: getCachedUser(),
    isAdmin: localStorage.getItem("roi_is_admin") === "1",
    loading: true,
  }));

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState({ token: null, user: null, isAdmin: false, loading: false });
      return;
    }
    try {
      const res = await invokeFn<{ valid: boolean; user?: RoiUser; is_admin?: boolean }>("auth-appid", { action: "verify", token });
      if (res?.valid && res.user) {
        saveSession(token, res.user, !!res.is_admin);
        setState({ token, user: res.user, isAdmin: !!res.is_admin, loading: false });
      } else {
        clearSession();
        setState({ token: null, user: null, isAdmin: false, loading: false });
      }
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => {
      setState({
        token: getToken(),
        user: getCachedUser(),
        isAdmin: localStorage.getItem("roi_is_admin") === "1",
        loading: false,
      });
    };
    window.addEventListener("roi-session", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("roi-session", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return state;
}
