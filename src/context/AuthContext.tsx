import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
} from "firebase/auth";
import { firebaseAuth, googleProvider } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // OTP password reset
  requestPasswordOtp: (email: string) => Promise<void>;
  verifyOtpAndResetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

/** Convenience hook — returns the Firebase UID string (or null). */
export const useAuthUid = () => useAuth().user?.uid ?? null;

async function ensureProfile(user: FirebaseUser) {
  // Upsert profile row keyed by firebase_uid
  await supabase.from("profiles").upsert(
    {
      firebase_uid: user.uid,
      display_name: user.displayName ?? user.email?.split("@")[0] ?? "User",
      avatar_url: user.photoURL ?? null,
    },
    { onConflict: "firebase_uid" }
  );
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        try { await ensureProfile(u); } catch (e) { console.warn("ensureProfile failed", e); }
      }
    });
    return unsub;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(firebaseAuth, googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(firebaseAuth);
  }, []);

  const requestPasswordOtp = useCallback(async (email: string) => {
    const { data, error } = await supabase.functions.invoke("send-password-otp", {
      body: { email },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
  }, []);

  const verifyOtpAndResetPassword = useCallback(
    async (email: string, otp: string, newPassword: string) => {
      const { data, error } = await supabase.functions.invoke("verify-otp-and-reset", {
        body: { email, otp, newPassword },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        requestPasswordOtp,
        verifyOtpAndResetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
