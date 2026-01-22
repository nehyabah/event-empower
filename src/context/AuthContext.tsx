import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { apiClient } from '@/services/api/client';

export type UserType = 'client' | 'vendor' | 'planner';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  userType: UserType;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType?: UserType) => Promise<void>;
  register: (email: string, password: string, name: string, userType?: UserType) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (idToken: string, userType?: UserType) => Promise<void>;
  sendPhoneOtp: (phone: string, channel: 'sms' | 'whatsapp') => Promise<void>;
  verifyPhoneOtp: (phone: string, code: string, userType?: UserType) => Promise<void>;
  updateUser: (updates: { name?: string; userType?: UserType }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  // Check for existing session on mount - only once
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initAuth = async () => {
      try {
        const response = await apiClient.post<{
          user: AuthUser;
          accessToken: string;
        }>('/auth/refresh');

        if (response.data) {
          setUser(response.data.user);
          apiClient.setAccessToken(response.data.accessToken);
        }
      } catch {
        // No valid session, user stays null
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Set up token refresh interval (every 14 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const response = await apiClient.post<{
          user: AuthUser;
          accessToken: string;
        }>('/auth/refresh');

        if (response.data) {
          apiClient.setAccessToken(response.data.accessToken);
        }
      } catch {
        // Token refresh failed, user will be logged out on next protected action
      }
    }, 14 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, password: string, userType?: UserType) => {
    const response = await apiClient.post<{
      user: AuthUser;
      accessToken: string;
    }>('/auth/login', { email, password, userType });

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      setUser(response.data.user);
      apiClient.setAccessToken(response.data.accessToken);
    }
  };

  const register = async (email: string, password: string, name: string, userType?: UserType) => {
    const response = await apiClient.post<{
      user: AuthUser;
      accessToken: string;
    }>('/auth/register', { email, password, name, userType });

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      setUser(response.data.user);
      apiClient.setAccessToken(response.data.accessToken);
    }
  };

  const logout = async () => {
    await apiClient.post('/auth/logout');
    setUser(null);
    apiClient.setAccessToken(null);
  };

  const loginWithGoogle = async (idToken: string, userType?: UserType) => {
    const response = await apiClient.post<{
      user: AuthUser;
      accessToken: string;
      isNewUser: boolean;
    }>('/auth/google', { idToken, userType });

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      setUser(response.data.user);
      apiClient.setAccessToken(response.data.accessToken);
    }
  };

  const sendPhoneOtp = async (phone: string, channel: 'sms' | 'whatsapp') => {
    const response = await apiClient.post('/auth/phone/send-otp', { phone, channel });

    if (response.error) {
      throw new Error(response.error);
    }
  };

  const verifyPhoneOtp = async (phone: string, code: string, userType?: UserType) => {
    const response = await apiClient.post<{
      user: AuthUser;
      accessToken: string;
      isNewUser: boolean;
    }>('/auth/phone/verify-otp', { phone, code, userType });

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      setUser(response.data.user);
      apiClient.setAccessToken(response.data.accessToken);
    }
  };

  const updateUser = async (updates: { name?: string; userType?: UserType }) => {
    const response = await apiClient.patch<AuthUser>('/users/me', updates);

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      setUser(response.data);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
