
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import LoginFormFields from "./LoginFormFields";
import SocialLoginButtons from "./SocialLoginButtons";

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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem("authenticated", "true");
      localStorage.setItem("userType", data.userType);
      localStorage.setItem("userEmail", data.email);
      
      const firstName = data.email.split('@')[0].split('.')[0];
      const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      
      toast.success(`Welcome back, ${capitalizedName}! 👋`, {
        description: "We're so happy to see you again!",
        duration: 5000,
      });
      
      if (onSuccess) onSuccess();
      
      if (data.userType === "planner") {
        navigate("/planner-home");
      } else if (data.userType === "vendor") {
        navigate("/vendor-home");
      } else {
        navigate("/home");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <LoginFormFields control={form.control} isLoading={isLoading} />
        </form>
      </Form>
      
      <SocialLoginButtons />
    </div>
  );
};

export default LoginForm;
