
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

// Get the current user from Supabase
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    return null;
  }
  
  // Fetch user profile from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, user_type')
    .eq('id', session.user.id)
    .single();
  
  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError);
    return {
      id: session.user.id,
      email: session.user.email || "",
      name: session.user.email?.split('@')[0] || "",
      userType: "client" as UserType
    };
  }
  
  return {
    id: session.user.id,
    email: session.user.email || "",
    name: profile.name || session.user.email?.split('@')[0] || "",
    userType: profile.user_type as UserType || "client"
  };
};

// Register a new user
export const registerUser = async (credentials: RegisterCredentials): Promise<AuthUser> => {
  // Convert role to userType
  const userType = credentials.role === "couple" ? "client" : credentials.role;
  
  // Register the user with Supabase
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        name: credentials.name,
        userType: userType
      }
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error("Failed to create user");
  }
  
  return {
    id: data.user.id,
    email: data.user.email || "",
    name: credentials.name,
    userType: userType as UserType
  };
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<AuthUser> => {
  // Sign in with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error("Failed to sign in");
  }
  
  // Update userType if different from selected
  if (credentials.userType) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ user_type: credentials.userType })
      .eq('id', data.user.id);
    
    if (updateError) {
      console.error("Failed to update user type:", updateError);
    }
  }
  
  // Get the user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, user_type')
    .eq('id', data.user.id)
    .single();
  
  if (profileError) {
    console.error("Profile fetch error:", profileError);
  }
  
  return {
    id: data.user.id,
    email: data.user.email || "",
    name: profile?.name || data.user.email?.split('@')[0] || "",
    userType: profile?.user_type as UserType || credentials.userType
  };
};

// Logout user
export const logoutUser = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
    throw new Error(error.message);
  }
};

// Gmail sign in
export const signInWithGmail = async (): Promise<AuthUser> => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Since OAuth redirects, we won't get a user here
  // The user will be automatically redirected, and we'll handle the session in App.tsx
  return {
    id: "",
    email: "",
    name: "",
    userType: "client"
  };
};

// Phone number sign in (requires verifying OTP in a separate step)
export const signInWithPhone = async (phoneNumber: string, channel: "sms" | "whatsapp" = "sms"): Promise<void> => {
  const { error } = await supabase.auth.signInWithOtp({
    phone: phoneNumber,
    options: {
      channel: channel
    }
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  // Return void since we need to verify OTP in a second step
};

// Verify phone OTP
export const verifyPhoneOTP = async (phoneNumber: string, otp: string): Promise<AuthUser> => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phoneNumber,
    token: otp,
    type: 'sms'
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  if (!data.user) {
    throw new Error("Failed to verify OTP");
  }
  
  // Get the user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, user_type')
    .eq('id', data.user.id)
    .single();
  
  if (profileError) {
    console.error("Profile fetch error:", profileError);
  }
  
  return {
    id: data.user.id,
    email: data.user.email || "",
    name: profile?.name || data.user.email?.split('@')[0] || "",
    userType: profile?.user_type as UserType || "client"
  };
};
