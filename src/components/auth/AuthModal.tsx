
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';

interface AuthModalProps {
  defaultTab?: "login" | "register";
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

const AuthModal = ({ 
  defaultTab = "login", 
  trigger, 
  triggerClassName = "" 
}: AuthModalProps) => {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            className={`${triggerClassName} ${defaultTab === "login" ? "bg-accent" : "bg-primary"}`}
            variant={defaultTab === "login" ? "outline" : "default"}
          >
            {defaultTab === "login" ? "Log in" : "Get Started"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-serif text-center">
            {defaultTab === "login" ? "Welcome Back" : "Join EventEmpower"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {defaultTab === "login" 
              ? "Login to your account to continue planning your perfect event."
              : "Create an account to start planning your perfect event."}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid grid-cols-2 mx-6 mt-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="p-6 pt-4">
            <LoginForm onSuccess={() => setOpen(false)} />
          </TabsContent>
          
          <TabsContent value="register" className="p-6 pt-4">
            <RegisterForm onSuccess={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
