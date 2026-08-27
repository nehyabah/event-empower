import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
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
  FormDescription,
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
  // City, Instagram and WhatsApp moved to the vendor's own profile — asking for
  // them here made signup nine fields deep and blocked Google signups, which
  // supply none of them. Business name stays: the approvals queue is keyed on it.
  if (d.role !== "couple") {
    return !!(d.businessName?.trim());
  }
  return true;
}, {
  message: "Business name is required",
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

  // Google is the primary path now, so the email fields start collapsed —
  // expanded, the form ran past the top and bottom of a laptop viewport.
  const [showEmailForm, setShowEmailForm] = useState(false);
  const navigate = useNavigate();
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
        toast.success("Account created", {
          description: "Add your details so we can review your application.",
          duration: 6000,
        });
        // Onboarding is theirs to do — nobody else knows their business.
        navigate(userType === "vendor" ? "/vendor-profile" : "/planner-profile", {
          replace: true,
          state: { onboarding: true },
        });
        return;
      } else {
        toast.success("Welcome to àjọyọ̀!", {
          description: `Let's start planning, ${data.name}!`,
        });
        // A new couple otherwise lands on a dashboard of empty widgets with
        // nothing indicating where to begin.
        navigate("/setup", { replace: true });
        return;
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

        {/* Offered before the form rather than after it — a Google signup skips
            the password entirely, so burying it under the fields wastes the
            typing. It follows the role chosen above. */}
        <div className="space-y-3">
          <GoogleSignInButton
            userType={role === "couple" ? "client" : role}
            onSuccess={({ isNewUser }) => {
              // A professional signing up with Google gives us nothing but an
              // email, so send them straight to their own profile to fill it
              // in — an admin cannot invent their business details.
              if (isNewUser && role !== "couple") {
                navigate(role === "vendor" ? "/vendor-profile" : "/planner-profile", {
                  replace: true,
                  state: { onboarding: true },
                });
                return;
              }
              if (isNewUser) {
                navigate("/setup", { replace: true });
                return;
              }
              onSuccess?.();
            }}
          />
          {!showEmailForm && (
            <button
              type="button"
              onClick={() => setShowEmailForm(true)}
              className="w-full text-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              or sign up with email
            </button>
          )}
        </div>

        {showEmailForm && (
          <>
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
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business / Brand Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={role === "vendor" ? "e.g. Bloom Photography" : "e.g. Ife Events Co."}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Shown to our team when reviewing your application. You can add your
                    city, Instagram and WhatsApp from your profile once approved.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
          </>
        )}
      </form>
    </Form>
  );
};

export default RegisterForm;
