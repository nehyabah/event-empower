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
  userType: z.enum(["client", "vendor"]).default("client"),
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
      
      navigate("/home");
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
          
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>I am a:</FormLabel>
                <FormControl>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-primary"
                        value="client"
                        checked={field.value === "client"}
                        onChange={() => field.onChange("client")}
                      />
                      <span>Client (Couple)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        className="form-radio h-4 w-4 text-primary"
                        value="vendor"
                        checked={field.value === "vendor"}
                        onChange={() => field.onChange("vendor")}
                      />
                      <span>Vendor</span>
                    </label>
                  </div>
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
