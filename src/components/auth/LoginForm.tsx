
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import LoginFormFields from "./LoginFormFields";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      console.log("Login data:", data);

      const authUser = await login(data.email, data.password);

      // Debug: Log the user type returned from API
      console.log("Login response - userType:", authUser.userType, "Full user:", authUser);

      // Extract first name for greeting
      const rawName = (authUser.name || authUser.email || "").trim();
      const firstName = rawName ? rawName.split(" ")[0] : "";
      const capitalizedName = firstName
        ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
        : "there";

      toast({
        title: `Welcome back, ${capitalizedName}!`,
        description: "We're so happy to see you again!",
        variant: "default",
      });

      // Close the modal - ProtectedRoute will handle navigation
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Login error:", error);
      const message =
        error instanceof Error ? error.message : "Please check your credentials and try again.";
      form.setError("password", { type: "manual", message }, { shouldFocus: true });
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
