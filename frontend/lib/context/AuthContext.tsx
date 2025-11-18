'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserWithoutPassword, UserRole } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: UserWithoutPassword | null;
  token: string | null;
  login: (token: string, user: UserWithoutPassword) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage
  const [user, setUser] = useState<UserWithoutPassword | null>(() => {
    if (globalThis.window !== undefined) {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (globalThis.window !== undefined) {
      return localStorage.getItem('token');
    }
    return null;
  });

  const [isLoading] = useState(false);

  const login = (newToken: string, newUser: UserWithoutPassword) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    authApi.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Role-based hooks
export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      globalThis.window.location.href = '/login';
    }

    if (!isLoading && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        globalThis.window.location.href = '/unauthorized';
      }
    }
  }, [isLoading, isAuthenticated, allowedRoles, user]);

  return { user, isLoading };
}
