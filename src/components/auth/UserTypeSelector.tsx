
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Control } from "react-hook-form";
import { Heart, Briefcase, Store } from "lucide-react";

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
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem value="client" id="client" className="sr-only" />
                <label
                  htmlFor="client"
                  className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                    field.value === "client"
                      ? "border-zinc-400 bg-zinc-100 text-zinc-700 shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  Couple
                </label>
              </div>
              <div>
                <RadioGroupItem value="planner" id="planner" className="sr-only" />
                <label
                  htmlFor="planner"
                  className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                    field.value === "planner"
                      ? "border-zinc-400 bg-zinc-100 text-zinc-700 shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  Planner
                </label>
              </div>
              <div>
                <RadioGroupItem value="vendor" id="vendor" className="sr-only" />
                <label
                  htmlFor="vendor"
                  className={`flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                    field.value === "vendor"
                      ? "border-zinc-400 bg-zinc-100 text-zinc-700 shadow-sm"
                      : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <Store className="h-4 w-4" />
                  Vendor
                </label>
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
