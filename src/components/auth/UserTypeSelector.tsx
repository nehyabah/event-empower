
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Control } from "react-hook-form";

interface UserTypeSelectorProps {
  control: Control<any>;
}

const UserTypeSelector = ({ control }: UserTypeSelectorProps) => {
  return (
    <FormField
      control={control}
      name="userType"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>I am a:</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-wrap space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="client" />
                <label htmlFor="client" className="cursor-pointer">Client (Couple)</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="planner" id="planner" />
                <label htmlFor="planner" className="cursor-pointer">Planner</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vendor" id="vendor" />
                <label htmlFor="vendor" className="cursor-pointer">Vendor</label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default UserTypeSelector;
