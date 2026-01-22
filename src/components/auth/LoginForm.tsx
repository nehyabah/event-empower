
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import LoginFormFields from "./LoginFormFields";
import { useAuth, UserType } from "@/context/AuthContext";

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
  const { login } = useAuth();

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

      await login(data.email, data.password, data.userType as UserType);

      // Extract first name for greeting
      const firstName = data.email.split('@')[0];
      const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

      toast({
        title: `Welcome back, ${capitalizedName}!`,
        description: "We're so happy to see you again!",
        variant: "default",
      });

      // Close the modal - ProtectedRoute will handle navigation
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
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
    </div>
  );
};

export default LoginForm;
