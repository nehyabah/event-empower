
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import LoginFormFields from "./LoginFormFields";
import SocialLoginButtons from "./SocialLoginButtons";
import { loginUser, signInWithGmail, UserType } from "@/services/authService";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["client", "vendor", "planner"]).default("client"),
});

type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      userType: "client",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      console.log("Login data:", data);
      
      const user = await loginUser({
        email: data.email,
        password: data.password,
        userType: data.userType as UserType
      });
      
      // Extract first name for greeting
      const firstName = user.name.split(' ')[0] || user.email.split('@')[0];
      const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      
      toast.success(`Welcome back, ${capitalizedName}! 👋`, {
        description: "We're so happy to see you again!",
        duration: 5000,
      });
      
      if (onSuccess) onSuccess();
      
      if (user.userType === "planner") {
        navigate("/planner-home");
      } else if (user.userType === "vendor") {
        navigate("/vendor-home");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (method: string) => {
    if (method === "gmail") {
      setIsLoading(true);
      try {
        const user = await signInWithGmail();
        
        toast.success(`Welcome, ${user.name}! 👋`, {
          description: "You've successfully signed in with Gmail!",
          duration: 5000,
        });
        
        if (onSuccess) onSuccess();
        navigate("/home");
      } catch (error) {
        console.error("Gmail login error:", error);
        toast.error("Gmail login failed", {
          description: "Unable to sign in with Gmail. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <LoginFormFields control={form.control} isLoading={isLoading} />
        </form>
      </Form>
      
      <SocialLoginButtons onSocialLogin={handleSocialLogin} isLoading={isLoading} />
    </div>
  );
};

export default LoginForm;
