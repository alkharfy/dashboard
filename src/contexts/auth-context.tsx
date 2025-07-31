"use client";

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type UserRole = 'Admin' | 'Designer' | 'Reviewer' | 'Manager';

export type User = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
};

type AuthContextType = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  signup: (email: string, pass: string, name: string, role: UserRole) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultUsers: { [key: string]: Omit<User, 'email' | 'uid'> } = {
  'admin@example.com': { name: 'Admin User', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=admin' },
  'manager@example.com': { name: 'Manager User', role: 'Manager', avatar: 'https://i.pravatar.cc/150?u=manager' },
  'designer@example.com': { name: 'Designer User', role: 'Designer', avatar: 'https://i.pravatar.cc/150?u=designer' },
  'reviewer@example.com': { name: 'Reviewer User', role: 'Reviewer', avatar: 'https://i.pravatar.cc/150?u=reviewer' },
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = useCallback(async (firebaseUser: FirebaseUser) => {
    const token = await firebaseUser.getIdTokenResult();
    const role = (token.claims.role as UserRole) || 'Designer'; 
    
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      setUser(userDocSnap.data() as User);
    } else {
        // This case would be for users that exist in auth, but not firestore
        // We can create a default profile for them.
        const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || defaultUsers[firebaseUser.email!]?.name || 'New User',
            role: role,
            avatar: defaultUsers[firebaseUser.email!]?.avatar || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
        }
        await setDoc(userDocRef, newUser);
        setUser(newUser);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await fetchUserData(fbUser);
        router.push('/dashboard');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, fetchUserData]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    await signInWithEmailAndPassword(auth, email, pass);
    // onAuthStateChanged will handle the rest
  };

  const signup = async (email: string, pass: string, name: string, role: UserRole) => {
    setLoading(true);
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const newUser: User = {
        uid: userCredential.user.uid,
        email: email,
        name: name,
        role: role,
        avatar: `https://i.pravatar.cc/150?u=${userCredential.user.uid}`,
    };
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    // Note: You need a cloud function to set custom claims for the role.
    // For now, we rely on the Firestore document.
    setUser(newUser);
    setLoading(false);
  }

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    router.push('/');
  }, [router]);

  const value: AuthContextType = {
    user,
    firebaseUser,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    signup
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
