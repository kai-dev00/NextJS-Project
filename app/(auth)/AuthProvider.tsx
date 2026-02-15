"use client";

import { createContext, useContext } from "react";

type AuthContextType = {
  role: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  value,
  children,
}: {
  value: AuthContextType;
  children: React.ReactNode;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");

  const hasRole = (role: string) => ctx.role === role;

  return {
    hasRole,
    role: ctx.role,
  };
}
