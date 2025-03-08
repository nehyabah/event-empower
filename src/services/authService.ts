
import { toast } from "@/components/ui/use-toast";

export type UserType = "client" | "vendor" | "planner";

export interface LoginCredentials {
  email: string;
  password: string;
  userType: UserType;
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

// Simulated database of users for development (will be replaced with real backend)
const USERS_STORAGE_KEY = "planr_users";

// Helper to get users from localStorage
const getStoredUsers = (): Record<string, AuthUser> => {
  const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
  return usersStr ? JSON.parse(usersStr) : {};
};

// Helper to save users to localStorage
const saveUsers = (users: Record<string, AuthUser>) => {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

// Persist the current user
const setCurrentUser = (user: AuthUser | null) => {
  if (user) {
    localStorage.setItem("authenticated", "true");
    localStorage.setItem("userType", user.userType);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userId", user.id);
    localStorage.setItem("userName", user.name);
  } else {
    localStorage.removeItem("authenticated");
    localStorage.removeItem("userType");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
  }
};

// Get the current user from localStorage
export const getCurrentUser = (): AuthUser | null => {
  const isAuthenticated = localStorage.getItem("authenticated") === "true";
  
  if (!isAuthenticated) return null;
  
  return {
    id: localStorage.getItem("userId") || "",
    email: localStorage.getItem("userEmail") || "",
    name: localStorage.getItem("userName") || "",
    userType: (localStorage.getItem("userType") as UserType) || "client",
  };
};

// Register a new user
export const registerUser = async (credentials: RegisterCredentials): Promise<AuthUser> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const users = getStoredUsers();
  
  // Check if user already exists
  if (users[credentials.email]) {
    throw new Error("User with this email already exists");
  }
  
  // Create new user
  const newUser: AuthUser = {
    id: Date.now().toString(),
    email: credentials.email,
    name: credentials.name,
    userType: credentials.role === "couple" ? "client" : credentials.role,
  };
  
  // Store user with email as key and password and user data
  users[credentials.email] = newUser;
  saveUsers(users);
  
  // Also store a separate password map
  const passwordsStr = localStorage.getItem("planr_passwords") || "{}";
  const passwords = JSON.parse(passwordsStr);
  passwords[credentials.email] = credentials.password;
  localStorage.setItem("planr_passwords", JSON.stringify(passwords));
  
  // Set as current user
  setCurrentUser(newUser);
  
  return newUser;
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<AuthUser> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const users = getStoredUsers();
  const user = users[credentials.email];
  
  // Validate user exists
  if (!user) {
    throw new Error("Invalid email or password");
  }
  
  // Validate password
  const passwordsStr = localStorage.getItem("planr_passwords") || "{}";
  const passwords = JSON.parse(passwordsStr);
  const storedPassword = passwords[credentials.email];
  
  if (storedPassword !== credentials.password) {
    throw new Error("Invalid email or password");
  }
  
  // Update user type if different from stored (in case they change their role)
  if (user.userType !== credentials.userType) {
    user.userType = credentials.userType;
    users[credentials.email] = user;
    saveUsers(users);
  }
  
  // Set as current user
  setCurrentUser(user);
  
  return user;
};

// Logout user
export const logoutUser = (): void => {
  setCurrentUser(null);
};

// Gmail sign in (simulated)
export const signInWithGmail = async (): Promise<AuthUser> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate a Gmail login with random data
  const randomId = Math.floor(Math.random() * 10000);
  const mockGmailUser: AuthUser = {
    id: `gmail-${randomId}`,
    email: `user${randomId}@gmail.com`,
    name: `Gmail User ${randomId}`,
    userType: "client",
  };
  
  // Save this user
  const users = getStoredUsers();
  users[mockGmailUser.email] = mockGmailUser;
  saveUsers(users);
  
  // Set as current user
  setCurrentUser(mockGmailUser);
  
  return mockGmailUser;
};

// Phone number sign in (simulated)
export const signInWithPhone = async (phoneNumber: string): Promise<AuthUser> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!phoneNumber || phoneNumber.length < 10) {
    throw new Error("Invalid phone number");
  }
  
  // Simulate a phone login
  const mockPhoneUser: AuthUser = {
    id: `phone-${Date.now()}`,
    email: `${phoneNumber}@phone.user`,
    name: `Phone User`,
    userType: "client",
  };
  
  // Save this user
  const users = getStoredUsers();
  users[mockPhoneUser.email] = mockPhoneUser;
  saveUsers(users);
  
  // Set as current user
  setCurrentUser(mockPhoneUser);
  
  return mockPhoneUser;
};
