"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/verify-email',
      }
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    // 如果没有提供密码，则发送 OTP（用于管理员登录）
    if (!password) {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // 不自动创建用户，只允许已存在的账户登录
        }
      });
      return { data, error };
    }

    // 使用密码登录（用于普通作者登录）
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const verifyOTP = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    return { data, error };
  };

  const resendVerification = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const checkIsAdmin = async () => {
    if (!session?.user?.id) {
      console.log("checkIsAdmin: No user session");
      return false;
    }

    console.log("checkIsAdmin: Checking for user ID:", session.user.id);

    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      console.error("checkIsAdmin error:", error);
      return false;
    }

    const isAdmin = data !== null;
    console.log("checkIsAdmin result:", isAdmin, "data:", data);
    return isAdmin;
  };

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      signUp,
      signIn,
      signOut,
      verifyOTP,
      resendVerification,
      checkIsAdmin,
      loading: session === undefined
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
