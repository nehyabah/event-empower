
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/useWishlist";

const bankDetailSchema = z.object({
  bankName: z.string().min(2, {
    message: "Bank name must be at least 2 characters.",
  }),
  accountName: z.string().min(2, {
    message: "Account name must be at least 2 characters.",
  }),
  accountNumber: z.string().min(8, {
    message: "Account number must be at least 8 characters.",
  }),
  sortCode: z.string().min(6, {
    message: "Sort code must be at least 6 characters.",
  }),
  description: z.string().optional(),
});

interface BankDetailsFormProps {
  onSuccess?: () => void;
}

const BankDetailsForm = ({ onSuccess }: BankDetailsFormProps) => {
  const { addBankDetail } = useWishlist();

  const form = useForm<z.infer<typeof bankDetailSchema>>({
    resolver: zodResolver(bankDetailSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      sortCode: "",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof bankDetailSchema>) => {
    // Ensure all required fields are present for BankDetail type
    addBankDetail({
      bankName: values.bankName,
      accountName: values.accountName,
      accountNumber: values.accountNumber,
      sortCode: values.sortCode,
      description: values.description,
    });
    form.reset();
    
    // Call the onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input placeholder="GTBank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input placeholder="0123456789" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sortCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort Code</FormLabel>
              <FormControl>
                <Input placeholder="123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Wedding gift contributions"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="submit">Add Bank Detail</Button>
        </div>
      </form>
    </Form>
  );
};

export default BankDetailsForm;
