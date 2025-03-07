
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Facebook, Mail, Smartphone, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
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
      // This would be where you'd handle login via your auth service
      console.log("Login data:", data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set auth state
      localStorage.setItem("authenticated", "true");
      
      toast.success("Login successful!", {
        description: "Welcome back to Planr!",
      });
      
      if (onSuccess) onSuccess();
      
      // Redirect to dashboard
      navigate("/dashboard");
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
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="you@example.com" 
                    {...field} 
                    className="input-elegant"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="••••••••" 
                    type="password" 
                    {...field}
                    className="input-elegant" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="text-right">
            <Button 
              variant="link" 
              className="text-sm p-0 h-auto font-normal"
              type="button"
            >
              Forgot password?
            </Button>
          </div>
          
          <Button 
            type="submit" 
            className="w-full button-hover" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </Button>
        </form>
      </Form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" className="button-hover">
          <Mail className="mr-2 h-4 w-4" />
          Email
        </Button>
        <Button variant="outline" className="button-hover">
          <Smartphone className="mr-2 h-4 w-4" />
          Phone
        </Button>
        <Button variant="outline" className="button-hover">
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
