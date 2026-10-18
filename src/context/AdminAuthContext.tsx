import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ApiService } from '../services/api';

interface AdminUser {
  email: string;
  role: string;
  displayName: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  loginWithPassword: (passwordOrKey: string, email?: string) => Promise<boolean>;
  logout: () => void;
}

const ADMIN_STORAGE_KEY = 'tech_debate_admin_auth_v2';
const ADMIN_EMAIL_STORAGE_KEY = 'tech_debate_admin_email_v2';

// Browser-native cryptographic hashing (SHA-256) for serverless admin verification
async function computeSha256(input: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(input));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const storedEmail = localStorage.getItem(ADMIN_EMAIL_STORAGE_KEY);
      return isAuthenticated
        ? {
            email: storedEmail || 'admin@techdebate4.com',
            role: 'Event Super Admin',
            displayName: 'Tech Debate 4.0 Super Admin',
          }
        : null;
    } catch {
      return isAuthenticated
        ? {
            email: 'admin@techdebate4.com',
            role: 'Event Super Admin',
            displayName: 'Tech Debate 4.0 Super Admin',
          }
        : null;
    }
  });

  const loginWithPassword = async (
    passwordInput: string,
    email = 'admin@techdebate4.com'
  ): Promise<boolean> => {
    const trimmedPass = passwordInput.trim();
    const cleanEmail = (email || 'admin@techdebate4.com').trim().toLowerCase();

    if (!trimmedPass) return false;

    // 1. Try server-side PostgreSQL authentication when Express backend is available
    try {
      const res = await ApiService.loginAdmin({
        email: cleanEmail,
        password: trimmedPass,
      });

      if (res && res.success && res.user) {
        const userObj: AdminUser = {
          email: res.user.email,
          role: res.user.role || 'Event Super Admin',
          displayName: res.user.displayName || 'Tech Debate 4.0 Super Admin',
        };
        setIsAuthenticated(true);
        setAdminUser(userObj);
        try {
          localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
          localStorage.setItem(ADMIN_EMAIL_STORAGE_KEY, res.user.email);
        } catch {}
        return true;
      }
    } catch {
      // Backend API unreachable or serverless deployment (e.g. Vercel) -> proceed to secure Firestore auth
    }

    // 2. Verified Firestore Cloud Database authentication (Serverless / Vercel Compatibility)
    // Salted SHA-256 hash comparison verified against remote Firestore credentials without exposing password in bundle
    try {
      const authDocRef = doc(db, 'system_auth', 'admin');
      const authSnap = await getDoc(authDocRef);

      if (authSnap.exists()) {
        const authData = authSnap.data();
        if (authData && authData.salt && authData.hash) {
          const computedHash = await computeSha256(`${trimmedPass}:${authData.salt}`);
          const storedHash = String(authData.hash).toLowerCase();
          const expectedEmail = String(authData.email || 'admin@techdebate4.com').toLowerCase();

          if (computedHash === storedHash && cleanEmail === expectedEmail) {
            const userObj: AdminUser = {
              email: authData.email || 'admin@techdebate4.com',
              role: authData.role || 'Event Super Admin',
              displayName: authData.displayName || 'Tech Debate 4.0 Super Admin',
            };
            setIsAuthenticated(true);
            setAdminUser(userObj);
            try {
              localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
              localStorage.setItem(ADMIN_EMAIL_STORAGE_KEY, userObj.email);
            } catch {}
            return true;
          }
        }
      }
    } catch (firestoreErr) {
      console.warn('Firestore admin verification warning:', firestoreErr);
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_EMAIL_STORAGE_KEY);
    } catch {}
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated,
        adminUser,
        loginWithPassword,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
