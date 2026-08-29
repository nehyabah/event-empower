import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/client';
import { clearLocalCache, scopeLocalCacheTo } from '@/lib/localCache';

export type UserType = 'client' | 'vendor' | 'planner' | 'admin';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  userType: UserType;
  avatarUrl: string | null;
  adminRole?: string | null;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  /** Null until a professional first submits their profile for review. */
  onboardingSubmittedAt?: string | null;
  /** Only populated once /users/me has been fetched or saved - absent right
   *  after login, since the sign-in response never carried these. */
  notifyReminders?: boolean;
  notifyProductUpdates?: boolean;
  notifyNewsletter?: boolean;
  /** Undefined on older sessions; false only for an unconfirmed signup. */
  emailVerified?: boolean;
}

export interface RegisterExtraFields {
  businessName?: string;
  instagramHandle?: string;
  whatsappPhone?: string;
  city?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string, name: string, userType?: UserType, extra?: RegisterExtraFields) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: (idToken: string, userType?: UserType) => Promise<{ isNewUser: boolean }>;
  /** Adopt a session obtained elsewhere — e.g. the emailed sign-in code. */
  applySession: (user: AuthUser, accessToken: string) => void;
  /** Re-read the account, after something outside this context changed it. */
  refreshUser: () => Promise<void>;
  sendPhoneOtp: (phone: string, channel: 'sms' | 'whatsapp') => Promise<void>;
  verifyPhoneOtp: (phone: string, code: string, userType?: UserType) => Promise<void>;
  updateUser: (updates: {
    name?: string;
    /** Email is not self-editable — it is the account's identity. */
    userType?: UserType;
    notifyReminders?: boolean;
    notifyProductUpdates?: boolean;
    notifyNewsletter?: boolean;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isLoading) return;
    scopeLocalCacheTo(user?.id ?? null);
  }, [isLoading, user?.id]);

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

  // Clear user when the API client fires a session-expired event
  useEffect(() => {
    const handler = () => {
      setUser(null);
      apiClient.setAccessToken(null);
    };
    window.addEventListener('session-expired', handler);
    return () => window.removeEventListener('session-expired', handler);
  }, []);

  // Token refresh interval disabled for development
  // TODO: Re-enable for production
  // useEffect(() => {
  //   if (!user) return;
  //
  //   const interval = setInterval(async () => {
  //     try {
  //       const response = await apiClient.post<{
  //         user: AuthUser;
  //         accessToken: string;
  //       }>('/auth/refresh');
  //
  //       if (response.data) {
  //         apiClient.setAccessToken(response.data.accessToken);
  //       }
  //     } catch {
  //       // Token refresh failed, user will be logged out on next protected action
  //     }
  //   }, 14 * 60 * 1000);
  //
  //   return () => clearInterval(interval);
  // }, [user]);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{
      user: AuthUser;
      accessToken: string;
    }>('/auth/login', { email, password });

    if (response.error) {
      throw new Error(response.error);
    }

    if (response.data) {
      queryClient.clear();
      setUser(response.data.user);
      apiClient.setAccessToken(response.data.accessToken);
      return response.data.user;
    }

    throw new Error("Failed to sign in");
  };

  const register = async (email: string, password: string, name: string, userType?: UserType, extra?: RegisterExtraFields) => {
    const response = await apiClient.post<{
      user: AuthUser;
      accessToken: string;
    }>('/auth/register', { email, password, name, userType, ...extra });

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
    queryClient.clear();
    // The cache holds the couple's names, venue and date. Leaving it behind
    // showed them to whoever signed in next on this browser.
    clearLocalCache();
  };

  const refreshUser = async () => {
    const response = await apiClient.get<AuthUser>('/users/me');
    if (response.data) setUser(response.data);
  };

  const applySession = (nextUser: AuthUser, accessToken: string) => {
    setUser(nextUser);
    apiClient.setAccessToken(accessToken);
  };

  const loginWithGoogle = async (idToken: string, userType?: UserType): Promise<{ isNewUser: boolean }> => {
    const response = await apiClient.post<{
      user: AuthUser;
      accessToken: string;
      isNewUser: boolean;
    }>('/auth/google', { idToken, userType });

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error('Failed to sign in with Google');
    }

    setUser(response.data.user);
    apiClient.setAccessToken(response.data.accessToken);
    // A professional signing up this way still owes us their business details.
    return { isNewUser: response.data.isNewUser };
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

  const updateUser = async (updates: {
    name?: string;
    userType?: UserType;
    notifyReminders?: boolean;
    notifyProductUpdates?: boolean;
    notifyNewsletter?: boolean;
  }) => {
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
        applySession,
        refreshUser,
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
