import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthUser, LoginCredentials, RegisterCredentials, UserType } from '@event-empower/shared';
import { authService, apiClient } from '../services/api';
import { secureTokenStorage } from '../services/tokenStorage';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  register: (credentials: RegisterCredentials) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string, userType?: UserType) => Promise<AuthUser>;
  sendPhoneOtp: (phone: string, channel?: "sms" | "whatsapp") => Promise<void>;
  verifyPhoneOtp: (phone: string, otp: string, userType?: UserType) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        // No valid session
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const authUser = await authService.login(credentials);
    // Store refresh token from the response (intercepted in the shared client)
    setUser(authUser);
    return authUser;
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const authUser = await authService.register(credentials);
    setUser(authUser);
    return authUser;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string, userType?: UserType) => {
    const authUser = await authService.signInWithGoogle(idToken, userType);
    setUser(authUser);
    return authUser;
  }, []);

  const sendPhoneOtp = useCallback(async (phone: string, channel: "sms" | "whatsapp" = "sms") => {
    await authService.sendPhoneOtp(phone, channel);
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, otp: string, userType?: UserType) => {
    const authUser = await authService.verifyPhoneOtp(phone, otp, userType);
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if server logout fails, clear local state
    }
    apiClient.setAccessToken(null);
    await secureTokenStorage.clearAll();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        logout,
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
