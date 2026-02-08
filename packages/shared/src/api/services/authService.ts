import type { ApiClient } from '../client';
import type { AuthUser, AuthResponse, LoginCredentials, RegisterCredentials, UserType } from '../../types';

export function createAuthService(apiClient: ApiClient) {
  return {
    async getCurrentUser(): Promise<AuthUser | null> {
      const response = await apiClient.post<AuthResponse>('/auth/refresh');
      if (response.error || !response.data) {
        return null;
      }
      apiClient.setAccessToken(response.data.accessToken);
      return {
        id: response.data.user.id,
        email: response.data.user.email || "",
        name: response.data.user.name || "",
        userType: response.data.user.userType,
      };
    },

    async register(credentials: RegisterCredentials): Promise<AuthUser> {
      const userType = credentials.role === "couple" ? "client" : credentials.role;
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email: credentials.email,
        password: credentials.password,
        name: credentials.name,
        userType,
      });
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Failed to create user");
      apiClient.setAccessToken(response.data.accessToken);
      return {
        id: response.data.user.id,
        email: response.data.user.email || "",
        name: response.data.user.name || credentials.name,
        userType: response.data.user.userType,
      };
    },

    async login(credentials: LoginCredentials): Promise<AuthUser> {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Failed to sign in");
      apiClient.setAccessToken(response.data.accessToken);
      return {
        id: response.data.user.id,
        email: response.data.user.email || "",
        name: response.data.user.name || "",
        userType: response.data.user.userType,
      };
    },

    async logout(): Promise<void> {
      const response = await apiClient.post('/auth/logout');
      apiClient.setAccessToken(null);
      if (response.error) {
        console.error("Logout error:", response.error);
        throw new Error(response.error);
      }
    },

    async signInWithGoogle(idToken: string, userType?: UserType): Promise<AuthUser> {
      const response = await apiClient.post<AuthResponse & { isNewUser: boolean }>('/auth/google', {
        idToken,
        userType,
      });
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Failed to sign in with Google");
      apiClient.setAccessToken(response.data.accessToken);
      return {
        id: response.data.user.id,
        email: response.data.user.email || "",
        name: response.data.user.name || "",
        userType: response.data.user.userType,
      };
    },

    async sendPhoneOtp(phoneNumber: string, channel: "sms" | "whatsapp" = "sms"): Promise<void> {
      const response = await apiClient.post('/auth/phone/send-otp', {
        phone: phoneNumber,
        channel,
      });
      if (response.error) throw new Error(response.error);
    },

    async verifyPhoneOtp(phoneNumber: string, otp: string, userType?: UserType): Promise<AuthUser> {
      const response = await apiClient.post<AuthResponse & { isNewUser: boolean }>('/auth/phone/verify-otp', {
        phone: phoneNumber,
        code: otp,
        userType,
      });
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Failed to verify OTP");
      apiClient.setAccessToken(response.data.accessToken);
      return {
        id: response.data.user.id,
        email: response.data.user.email || "",
        name: response.data.user.name || "",
        userType: response.data.user.userType,
      };
    },
  };
}
