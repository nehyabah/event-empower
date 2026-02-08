
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Heart, Briefcase, Store } from "lucide-react";
import { useAuth, UserType } from "@/context/AuthContext";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["couple", "planner", "vendor"], {
    required_error: "Please select a role",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof formSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "couple",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);

    try {
      console.log("Registration data:", data);

      // Convert role to userType
      const userType: UserType = data.role === "couple" ? "client" : data.role;

      await register(data.email, data.password, data.name, userType);

      toast.success("Registration successful!", {
        description: `Welcome to Planr, ${data.name}! Start planning your perfect event.`,
      });

      // Close the modal - ProtectedRoute will handle navigation
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Please check your information and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Doe" 
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
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
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
          name="role"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>I am a...</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="grid grid-cols-3 gap-2"
                >
                  <div>
                    <RadioGroupItem value="couple" id="couple" className="sr-only" />
                    <Label
                      htmlFor="couple"
                      className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                        field.value === "couple"
                          ? "border-zinc-400 bg-zinc-100 text-zinc-700 shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <Heart className="h-4 w-4" />
                      Couple
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="planner" id="planner" className="sr-only" />
                    <Label
                      htmlFor="planner"
                      className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                        field.value === "planner"
                          ? "border-zinc-400 bg-zinc-100 text-zinc-700 shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <Briefcase className="h-4 w-4" />
                      Planner
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="vendor" id="vendor" className="sr-only" />
                    <Label
                      htmlFor="vendor"
                      className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                        field.value === "vendor"
                          ? "border-zinc-400 bg-zinc-100 text-zinc-700 shadow-sm"
                          : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <Store className="h-4 w-4" />
                      Vendor
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full mt-6 button-hover" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
