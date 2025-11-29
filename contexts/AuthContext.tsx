import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '@/types';
import { userStore, sessionStore } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = sessionStore.getCurrentUser();
    setUser(currentUser);
  }, []);

  const login = (username: string, password: string): boolean => {
    const authenticatedUser = userStore.authenticate(username, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      sessionStore.setCurrentUser(authenticatedUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStore.clearCurrentUser();
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: user !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
