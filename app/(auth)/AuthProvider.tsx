"use client";

import { createContext, useContext } from "react";

type AuthContextType = {
  role: string;
  permissions: string[];
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

export function usePermission() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("usePermission must be used inside AuthProvider");

  const can = (permission: string) => ctx.permissions.includes(permission);

  const hasRole = (role: string) => ctx.role === role;

  return {
    can,
    hasRole,
    role: ctx.role,
    permissions: ctx.permissions,
  };
}
