import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { mockUsers } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole, department: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const validCredentials: Record<string, { password: string; userId: string }> = {
  'admin@visioattend.com': { password: 'Admin@123', userId: 'user_1' },
  'teacher@visioattend.com': { password: 'Teacher@123', userId: 'user_2' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('visioattend_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Try backend first
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json() as { user: User };
        setUser(data.user);
        localStorage.setItem('visioattend_user', JSON.stringify(data.user));
        return true;
      }
    } catch {
      // ignore and fall back to local mock auth
    }

    const creds = validCredentials[email];
    if (creds && creds.password === password) {
      const foundUser = mockUsers.find(u => u.id === creds.userId)!;
      setUser(foundUser);
      localStorage.setItem('visioattend_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string, role: UserRole, department: string): Promise<boolean> => {
    const newUser: User = { id: `user_${Date.now()}`, name, email, role, department, createdAt: new Date().toISOString() };
    validCredentials[email] = { password: _password, userId: newUser.id };
    mockUsers.push(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('visioattend_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
