
import { useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Expense, ExpenseCategory, useExpenses } from "@/context/ExpenseContext";
import { cn } from "@/lib/utils";

const categories: { value: ExpenseCategory; label: string }[] = [
  { value: "venue", label: "Venue" },
  { value: "catering", label: "Catering" },
  { value: "attire", label: "Attire" },
  { value: "decoration", label: "Decoration" },
  { value: "photography", label: "Photography" },
  { value: "music", label: "Music" },
  { value: "transportation", label: "Transportation" },
  { value: "accommodation", label: "Accommodation" },
  { value: "invitations", label: "Invitations" },
  { value: "rings", label: "Rings" },
  { value: "gifts", label: "Gifts" },
  { value: "beauty", label: "Beauty" },
  { value: "other", label: "Other" },
];

interface ExpenseFormProps {
  expense?: Expense;
  onCancel: () => void;
}

const ExpenseForm = ({ expense, onCancel }: ExpenseFormProps) => {
  const { addExpense, updateExpense } = useExpenses();
  const [date, setDate] = useState<Date | undefined>(expense?.date || new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(expense?.dueDate || undefined);

  const form = useForm<Omit<Expense, "id">>({
    defaultValues: expense ? { ...expense } : {
      name: "",
      amount: 0,
      amountPaid: 0,
      category: "other",
      date: new Date(),
      dueDate: null,
      paid: false,
      notes: "",
    },
  });
  const amountValue = form.watch("amount");
  const amountPaidValue = form.watch("amountPaid");

  // What is still owed, shown live so the due date has obvious context.
  const balance = Math.max(
    (Number(amountValue) || 0) - (Number(amountPaidValue) || 0),
    0,
  );

  const onSubmit = (data: Omit<Expense, "id">) => {
    const amount = Number(data.amount) || 0;
    const amountPaid = Math.min(Math.max(Number(data.amountPaid) || 0, 0), Math.max(amount, 0));
    const paid = amountPaid >= amount;
    const payload = {
      ...data,
      amount,
      amountPaid,
      paid,
      date: date || new Date(),
      dueDate: dueDate ?? null,
    };
    if (expense) {
      updateExpense(expense.id, payload);
    } else {
      addExpense(payload);
    }
    onCancel();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter expense name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₦)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  {...field} 
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amountPaid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount Paid (₦)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  max={Number(amountValue) || 0}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Running balance, so "amount paid" and the due date read together */}
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
          <span className="text-sm text-muted-foreground">Balance owed</span>
          <span className={cn("text-sm font-semibold tabular-nums", balance > 0 ? "text-amber-600" : "text-emerald-600")}>
            ₦{balance.toLocaleString()}
          </span>
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Payment due</Label>
            {dueDate && (
              <button
                type="button"
                onClick={() => setDueDate(undefined)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>No due date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            Due dates appear on your calendar and drive overdue warnings.
          </p>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add notes (one per line)"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit">
            {expense ? "Update Expense" : "Add Expense"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExpenseForm;
