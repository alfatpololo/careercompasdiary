"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getClientAuthInstance } from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { useRouter } from "next/navigation";

type AuthContextValue = {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getClientAuthInstance();
    if (!auth) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    async login(email: string, password: string) {
      const auth = getClientAuthInstance();
      if (!auth) throw new Error("Firebase client is not initialized");
      await signInWithEmailAndPassword(auth, email, password);
    },
    async register(email: string, password: string) {
      const auth = getClientAuthInstance();
      if (!auth) throw new Error("Firebase client is not initialized");
      await createUserWithEmailAndPassword(auth, email, password);
    },
    async logout() {
      const auth = getClientAuthInstance();
      if (!auth) return;
      await signOut(auth);
    },
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}


