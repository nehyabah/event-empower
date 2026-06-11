import { apiClient } from "@/services/api/client";

export type UserType = "client" | "vendor" | "planner" | "admin";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: "couple" | "planner" | "vendor";
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  userType: UserType;
}

interface AuthResponse {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    userType: UserType;
    avatarUrl: string | null;
  };
  accessToken: string;
}

// Get the current user from the API
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  // Try to refresh the token to get current user
  const response = await apiClient.post<AuthResponse>('/auth/refresh');

  if (response.error || !response.data) {
    return null;
  }

  apiClient.setAccessToken(response.data.accessToken);

  return {
    id: response.data.user.id,
    email: response.data.user.email || "",
    name: response.data.user.name || "",
    userType: response.data.user.userType
  };
};

// Register a new user
export const registerUser = async (credentials: RegisterCredentials): Promise<AuthUser> => {
  // Convert role to userType
  const userType = credentials.role === "couple" ? "client" : credentials.role;

  const response = await apiClient.post<AuthResponse>('/auth/register', {
    email: credentials.email,
    password: credentials.password,
    name: credentials.name,
    userType: userType
  });

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error("Failed to create user");
  }

  apiClient.setAccessToken(response.data.accessToken);

  return {
    id: response.data.user.id,
    email: response.data.user.email || "",
    name: response.data.user.name || credentials.name,
    userType: response.data.user.userType
  };
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<AuthUser> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    email: credentials.email,
    password: credentials.password
  });

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error("Failed to sign in");
  }

  apiClient.setAccessToken(response.data.accessToken);

  return {
    id: response.data.user.id,
    email: response.data.user.email || "",
    name: response.data.user.name || "",
    userType: response.data.user.userType
  };
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  const response = await apiClient.post('/auth/logout');
  apiClient.setAccessToken(null);

  if (response.error) {
    console.error("Logout error:", response.error);
    throw new Error(response.error);
  }
};

// Gmail sign in - Note: This requires handling Google OAuth on the frontend first
export const signInWithGmail = async (idToken: string, userType?: UserType): Promise<AuthUser> => {
  const response = await apiClient.post<AuthResponse & { isNewUser: boolean }>('/auth/google', {
    idToken,
    userType
  });

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error("Failed to sign in with Google");
  }

  apiClient.setAccessToken(response.data.accessToken);

  return {
    id: response.data.user.id,
    email: response.data.user.email || "",
    name: response.data.user.name || "",
    userType: response.data.user.userType
  };
};

// Phone number sign in (requires verifying OTP in a separate step)
export const signInWithPhone = async (phoneNumber: string, channel: "sms" | "whatsapp" = "sms"): Promise<void> => {
  const response = await apiClient.post('/auth/phone/send-otp', {
    phone: phoneNumber,
    channel: channel
  });

  if (response.error) {
    throw new Error(response.error);
  }
};

// Verify phone OTP
export const verifyPhoneOTP = async (phoneNumber: string, otp: string, userType?: UserType): Promise<AuthUser> => {
  const response = await apiClient.post<AuthResponse & { isNewUser: boolean }>('/auth/phone/verify-otp', {
    phone: phoneNumber,
    code: otp,
    userType
  });

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error("Failed to verify OTP");
  }

  apiClient.setAccessToken(response.data.accessToken);

  return {
    id: response.data.user.id,
    email: response.data.user.email || "",
    name: response.data.user.name || "",
    userType: response.data.user.userType
  };
};
