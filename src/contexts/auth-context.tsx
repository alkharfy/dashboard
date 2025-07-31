"use client";

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'Admin' | 'Designer' | 'Reviewer' | 'Manager';

export type User = {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
};

const mockUsers: Record<UserRole, User> = {
  Admin: { name: 'Admin User', email: 'admin@example.com', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=admin' },
  Designer: { name: 'Designer User', email: 'designer@example.com', role: 'Designer', avatar: 'https://i.pravatar.cc/150?u=designer' },
  Reviewer: { name: 'Reviewer User', email: 'reviewer@example.com', role: 'Reviewer', avatar: 'https://i.pravatar.cc/150?u=reviewer' },
  Manager: { name: 'Manager User', email: 'manager@example.com', role: 'Manager', avatar: 'https://i.pravatar.cc/150?u=manager' },
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
  }, []);

  const login = useCallback((role: UserRole) => {
    const userToLogin = mockUsers[role];
    setUser(userToLogin);
    localStorage.setItem('user', JSON.stringify(userToLogin));
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/');
  }, [router]);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
