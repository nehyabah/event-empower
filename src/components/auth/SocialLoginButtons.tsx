
import { Button } from "@/components/ui/button";
import { Facebook, Mail, Smartphone } from "lucide-react";

const SocialLoginButtons = () => {
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
    </>
  );
};

export default SocialLoginButtons;
