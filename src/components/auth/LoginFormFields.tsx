
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import UserTypeSelector from "./UserTypeSelector";

interface LoginFormFieldsProps {
  control: Control<any>;
  isLoading: boolean;
}

const LoginFormFields = ({ control, isLoading }: LoginFormFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
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
        control={control}
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
      
      <UserTypeSelector control={control} />
      
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
    </>
  );
};

export default LoginFormFields;
