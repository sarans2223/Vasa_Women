'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  currentUser: any | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Stub provider that returns null user
  return (
    <AuthContext.Provider value={{ currentUser: null, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useUser() {
  const { currentUser, loading } = useAuth();
  return { user: currentUser, loading, error: null };
}
