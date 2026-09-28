import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, AdminRole } from '@chronicle/shared';

export const ADMIN_INVITATION_CODE = 'CHRONICLE-STAFF-2025';

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; role: AdminRole; pass: string; inviteCode: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<AdminUser>) => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; resetCode?: string }>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
}

const DEFAULT_ADMINS: AdminUser[] = [
  {
    id: 'admin-elena',
    name: 'Elena Vance',
    email: 'admin@chronicle.press',
    role: 'Managing Editor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    department: 'Editorial Board',
    lastLogin: 'Today, 09:15 AM',
    twoFactorEnabled: true,
  },
  {
    id: 'admin-julian',
    name: 'Julian Thorne',
    email: 'tech@chronicle.press',
    role: 'Systems Administrator',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    department: 'Infrastructure & Tech',
    lastLogin: 'Today, 08:30 AM',
    twoFactorEnabled: true,
  },
];

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const sess = localStorage.getItem('chronicle_admin_session');
      return sess ? JSON.parse(sess) : DEFAULT_ADMINS[0];
    } catch {
      return DEFAULT_ADMINS[0];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);

    const found = DEFAULT_ADMINS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found || pass.length >= 6) {
      const loggedUser = found || {
        id: `admin-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'Senior Editor' as AdminRole,
        lastLogin: 'Just now',
        twoFactorEnabled: true,
      };
      setUser(loggedUser);
      localStorage.setItem('chronicle_admin_session', JSON.stringify(loggedUser));
      return { success: true };
    }
    return { success: false, error: 'Invalid staff email or access key.' };
  };

  const register = async (data: { name: string; email: string; role: AdminRole; pass: string; inviteCode: string }) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsLoading(false);

    if (data.inviteCode.trim() !== ADMIN_INVITATION_CODE) {
      return { success: false, error: 'Invalid or expired Chronicle staff invitation code.' };
    }

    const newUser: AdminUser = {
      id: `admin-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      lastLogin: 'Just now',
      twoFactorEnabled: true,
    };
    setUser(newUser);
    localStorage.setItem('chronicle_admin_session', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chronicle_admin_session');
  };

  const updateUser = (data: Partial<AdminUser>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('chronicle_admin_session', JSON.stringify(updated));
  };

  const requestPasswordReset = async (email: string) => {
    return { success: true, resetCode: '748-291' };
  };

  const verifyResetCode = async (_email: string, code: string) => {
    return code === '748-291' || code.length === 6;
  };

  const resetPassword = async (_email: string, _newPass: string) => {
    return { success: true };
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        requestPasswordReset,
        verifyResetCode,
        resetPassword,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
