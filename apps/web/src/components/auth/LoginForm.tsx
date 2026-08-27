
import { useState } from "react";
import EmailCodeSignIn from "@/components/auth/EmailCodeSignIn";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import LoginFormFields from "./LoginFormFields";
import { useAuth, AuthUser } from "@/context/AuthContext";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void;
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
      const authUser = await login(data.email, data.password);

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

      // The caller routes by role. A public page has no protected route to
      // do it, so signing in from /pricing used to leave you on /pricing.
      if (onSuccess) onSuccess(authUser);
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

      {/* Renders nothing unless VITE_GOOGLE_CLIENT_ID is configured. */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <GoogleSignInButton />
        <EmailCodeSignIn onSuccess={onSuccess} />
      </div>
    </div>
  );
};

export default LoginForm;
