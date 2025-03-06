
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
import { Loader2 } from "lucide-react";

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
      // This would be where you'd handle registration via your auth service
      console.log("Registration data:", data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Registration successful!", {
        description: "Welcome to EventEmpower! Start planning your perfect event.",
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed", {
        description: "Please check your information and try again.",
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
                  <div className="flex items-center">
                    <RadioGroupItem value="couple" id="couple" className="sr-only" />
                    <Label
                      htmlFor="couple"
                      className={`w-full text-center px-3 py-2 rounded-md cursor-pointer transition-all ${
                        field.value === "couple"
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "bg-secondary border border-secondary hover:bg-secondary/80"
                      }`}
                    >
                      Couple
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="planner" id="planner" className="sr-only" />
                    <Label
                      htmlFor="planner"
                      className={`w-full text-center px-3 py-2 rounded-md cursor-pointer transition-all ${
                        field.value === "planner"
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "bg-secondary border border-secondary hover:bg-secondary/80"
                      }`}
                    >
                      Planner
                    </Label>
                  </div>
                  <div className="flex items-center">
                    <RadioGroupItem value="vendor" id="vendor" className="sr-only" />
                    <Label
                      htmlFor="vendor"
                      className={`w-full text-center px-3 py-2 rounded-md cursor-pointer transition-all ${
                        field.value === "vendor"
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "bg-secondary border border-secondary hover:bg-secondary/80"
                      }`}
                    >
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
