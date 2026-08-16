import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
  ) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInAsGuest: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: {
    fullName?: string;
    avatarUrl?: string;
    defaultVisibility?: "public" | "private";
    notificationsEnabled?: boolean;
    activeAvatarFrame?: string | null;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load whatever session exists on first app load (keeps user logged in
    // between visits — this is what makes login "sticky").
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Keep session state in sync whenever it changes (login, logout, token refresh).
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone_number: phoneNumber },
      },
    });
    return { error: error?.message ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signInAsGuest = async () => {
    const guestNumber = Math.floor(10000 + Math.random() * 90000); // 5 digits
    const guestName = `guest-${guestNumber}`;
    const { error } = await supabase.auth.signInAnonymously({
      options: { data: { full_name: guestName } },
    });
    return { error: error?.message ?? null };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error?.message ?? null };
  };

  const updateProfile = async (updates: {
    fullName?: string;
    avatarUrl?: string;
    defaultVisibility?: "public" | "private";
    notificationsEnabled?: boolean;
    activeAvatarFrame?: string | null;
  }) => {
    const data: Record<string, unknown> = {};
    if (updates.fullName !== undefined) data.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) data.avatar_url = updates.avatarUrl;
    if (updates.defaultVisibility !== undefined) data.default_visibility = updates.defaultVisibility;
    if (updates.notificationsEnabled !== undefined) data.notifications_enabled = updates.notificationsEnabled;
    if (updates.activeAvatarFrame !== undefined) data.active_avatar_frame = updates.activeAvatarFrame;

    const { error } = await supabase.auth.updateUser({ data });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signUp,
        signIn,
        signInAsGuest,
        resetPassword,
        updatePassword,
        updateProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
