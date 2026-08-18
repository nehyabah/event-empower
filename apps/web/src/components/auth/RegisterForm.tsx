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
import { Loader2, Heart, Briefcase, Store, Instagram, MapPin, Phone } from "lucide-react";
import { useAuth, UserType } from "@/context/AuthContext";

const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["couple", "planner", "vendor"], { required_error: "Please select a role" }),
  businessName: z.string().optional(),
  city: z.string().optional(),
  instagramHandle: z.string().optional(),
  whatsappPhone: z.string().optional(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((d) => {
  if (d.role !== "couple") {
    return !!(d.businessName?.trim()) && !!(d.instagramHandle?.trim() || d.whatsappPhone?.trim());
  }
  return true;
}, {
  message: "Business name and at least Instagram or WhatsApp are required",
  path: ["businessName"],
});

type RegisterFormValues = z.infer<typeof baseSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "couple",
      businessName: "",
      city: "",
      instagramHandle: "",
      whatsappPhone: "",
    },
  });

  const role = form.watch("role");
  const isProfessional = role === "vendor" || role === "planner";

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const userType: UserType = data.role === "couple" ? "client" : data.role;
      await register(data.email, data.password, data.name, userType,
        isProfessional ? {
          businessName: data.businessName,
          instagramHandle: data.instagramHandle,
          whatsappPhone: data.whatsappPhone,
          city: data.city,
        } : undefined
      );

      if (isProfessional) {
        toast.success("Application submitted!", {
          description: "We'll review your profile and get back to you within 1 working day.",
          duration: 6000,
        });
      } else {
        toast.success("Welcome to àjọyọ̀!", {
          description: `Let's start planning, ${data.name}!`,
        });
      }

      if (onSuccess) onSuccess();
    } catch (error) {
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
        {/* Role selector */}
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
                  {[
                    { value: "couple", label: "Couple", icon: <Heart className="h-4 w-4" /> },
                    { value: "planner", label: "Planner", icon: <Briefcase className="h-4 w-4" /> },
                    { value: "vendor", label: "Vendor", icon: <Store className="h-4 w-4" /> },
                  ].map(({ value, label, icon }) => (
                    <div key={value}>
                      <RadioGroupItem value={value} id={value} className="sr-only" />
                      <Label
                        htmlFor={value}
                        className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition cursor-pointer ${
                          field.value === value
                            ? "border-zinc-400 bg-zinc-100 text-zinc-700 shadow-sm"
                            : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                      >
                        {icon}
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isProfessional ? "Your Full Name" : "Full Name"}</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} className="input-elegant" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} className="input-elegant" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} className="input-elegant" />
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
                <FormLabel>Confirm</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" {...field} className="input-elegant" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Professional extra fields */}
        {isProfessional && (
          <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Business Details (required for verification)
            </p>

            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business / Brand Name</FormLabel>
                  <FormControl>
                    <Input placeholder={role === "vendor" ? "e.g. Bloom Photography" : "e.g. Ife Events Co."} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City / State</FormLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                      <Input placeholder="e.g. Lagos" {...field} className="pl-9" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="instagramHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="@handle" {...field} className="pl-9" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsappPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="+234 800..." {...field} className="pl-9" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              We use this to verify your business. At least Instagram or WhatsApp is required.
            </p>
          </div>
        )}

        <Button type="submit" className="w-full mt-2 button-hover" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
          ) : isProfessional ? (
            "Submit Application"
          ) : (
            "Create Account"
          )}
        </Button>

        {isProfessional && (
          <p className="text-xs text-center text-muted-foreground">
            Applications are reviewed within 1 working day. You'll be notified once approved.
          </p>
        )}
      </form>
    </Form>
  );
};

export default RegisterForm;
