
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Smartphone, Loader2, Mail as Gmail } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { signInWithPhone, verifyPhoneOTP } from "@/services/authService";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface SocialLoginButtonsProps {
  onSocialLogin?: (method: string) => Promise<void>;
  isLoading?: boolean;
}

const SocialLoginButtons = ({ onSocialLogin, isLoading = false }: SocialLoginButtonsProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isPhoneLoginLoading, setIsPhoneLoginLoading] = useState(false);
  const [phoneMethod, setPhoneMethod] = useState<"sms" | "whatsapp">("sms");
  const navigate = useNavigate();

  const handlePhoneLogin = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }
    
    setIsPhoneLoginLoading(true);
    
    try {
      // Format phone number (simple example, might need more sophisticated formatting)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      if (!showOtpInput) {
        // Request OTP
        await signInWithPhone(formattedPhone, phoneMethod);
        
        toast({
          title: "Verification code sent",
          description: `Please check your ${phoneMethod === "whatsapp" ? "WhatsApp" : "phone"} for the verification code`,
          variant: "default",
        });
        
        setShowOtpInput(true);
      } else {
        // Verify OTP
        await verifyPhoneOTP(formattedPhone, otp);
        
        toast({
          title: `Welcome! 👋`,
          description: "You've successfully signed in with your phone number!",
          variant: "default",
        });
        
        setPhoneDialogOpen(false);
        navigate("/home");
      }
    } catch (error) {
      console.error("Phone login error:", error);
      toast({
        title: showOtpInput ? "Verification failed" : "Phone login failed",
        description: error instanceof Error ? error.message : "Unable to sign in with this phone number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPhoneLoginLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setPhoneDialogOpen(false);
    setShowOtpInput(false);
    setOtp("");
  };

  return (
    <>
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
        <Button 
          variant="outline" 
          className="button-hover"
          onClick={() => onSocialLogin && onSocialLogin("email")}
          disabled={isLoading}
        >
          <Mail className="mr-2 h-4 w-4" />
          Email
        </Button>
        
        <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="button-hover"
              disabled={isLoading}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Phone
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Sign in with Phone</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                {showOtpInput
                  ? "Enter the verification code sent to your phone."
                  : "Enter your phone number to receive a verification code."}
              </p>
              
              {!showOtpInput ? (
                <>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number (with country code)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mb-4"
                  />
                  <Select
                    value={phoneMethod}
                    onValueChange={(value) => setPhoneMethod(value as "sms" | "whatsapp")}
                  >
                    <SelectTrigger className="mb-4">
                      <SelectValue placeholder="Select OTP delivery method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mb-4"
                />
              )}
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handlePhoneLogin} 
                  disabled={isPhoneLoginLoading}
                >
                  {isPhoneLoginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {showOtpInput ? "Verifying..." : "Sending..."}
                    </>
                  ) : (
                    showOtpInput ? "Verify Code" : "Continue"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          className="button-hover"
          onClick={() => onSocialLogin && onSocialLogin("gmail")}
          disabled={isLoading}
        >
          <Gmail className="mr-2 h-4 w-4" />
          Google
        </Button>
      </div>
    </>
  );
};

export default SocialLoginButtons;
