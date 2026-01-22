import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  userService,
  Expense as ApiExpense,
  ExpenseCategory,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseSummary,
} from "@/services/api/userService";
import { toast } from "sonner";

export type { ExpenseCategory };

// Re-export the Expense type with a date field for backward compatibility
export interface Expense {
  id: string;
  name: string;
  amount: number;
  amountPaid: number;
  category: ExpenseCategory;
  date: Date;
  paid: boolean;
  notes?: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  totalBudget: number;
  setTotalBudget: (budget: number) => Promise<void>;
  totalSpent: number;
  remainingBudget: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeSummary = (data: ExpenseSummary): ExpenseSummary => ({
  ...data,
  total_spent: toNumber(data.total_spent),
  total_paid: toNumber(data.total_paid),
  total_unpaid: toNumber(data.total_unpaid),
  total_budget: toNumber(data.total_budget),
  remaining_budget: toNumber(data.remaining_budget),
  by_category: Object.fromEntries(
    Object.entries(data.by_category || {}).map(([key, value]) => [
      key,
      toNumber(value),
    ]),
  ),
});

// Convert API expense to local format
const toLocalExpense = (apiExpense: ApiExpense): Expense => ({
  id: apiExpense.id,
  name: apiExpense.name,
  amount: toNumber(apiExpense.amount),
  amountPaid: toNumber(apiExpense.amount_paid),
  category: apiExpense.category,
  date: apiExpense.expense_date
    ? new Date(apiExpense.expense_date)
    : new Date(),
  paid: apiExpense.paid,
  notes: apiExpense.notes || undefined,
});

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({
    total_spent: 0,
    total_paid: 0,
    total_unpaid: 0,
    total_budget: 0,
    remaining_budget: 0,
    by_category: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [expensesData, summaryData] = await Promise.all([
          userService.getExpenses(),
          userService.getExpenseSummary(),
        ]);
        setExpenses(expensesData.map(toLocalExpense));
        setSummary(normalizeSummary(summaryData));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch expenses";
        setError(message);
        console.error("Error fetching expenses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addExpense = useCallback(async (expense: Omit<Expense, "id">) => {
    try {
      const input: CreateExpenseInput = {
        name: expense.name,
        amount: expense.amount,
        amountPaid: expense.amountPaid,
        category: expense.category,
        date: expense.date.toISOString().split("T")[0],
        paid: expense.paid,
        notes: expense.notes,
      };

      const newExpense = await userService.createExpense(input);
      const localExpense = toLocalExpense(newExpense);
      setExpenses((prev) => [...prev, localExpense]);
      const unpaidAmount = Math.max(
        localExpense.amount - localExpense.amountPaid,
        0,
      );

      // Update summary
      setSummary((prev) => ({
        ...prev,
        total_spent: prev.total_spent + localExpense.amountPaid,
        total_paid: prev.total_paid + localExpense.amountPaid,
        total_unpaid: prev.total_unpaid + unpaidAmount,
        remaining_budget: prev.remaining_budget - localExpense.amountPaid,
      }));

      toast.success("Expense added successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add expense";
      toast.error(message);
      throw err;
    }
  }, []);

  const updateExpense = useCallback(
    async (id: string, updatedExpense: Partial<Expense>) => {
      try {
        const input: UpdateExpenseInput = {};
        if (updatedExpense.name !== undefined) input.name = updatedExpense.name;
        if (updatedExpense.amount !== undefined)
          input.amount = updatedExpense.amount;
        if (updatedExpense.amountPaid !== undefined)
          input.amountPaid = updatedExpense.amountPaid;
        if (updatedExpense.category !== undefined)
          input.category = updatedExpense.category;
        if (updatedExpense.date !== undefined)
          input.date = updatedExpense.date.toISOString().split("T")[0];
        if (updatedExpense.paid !== undefined) input.paid = updatedExpense.paid;
        if (updatedExpense.notes !== undefined)
          input.notes = updatedExpense.notes;

        const updated = await userService.updateExpense(id, input);
        setExpenses((prev) =>
          prev.map((e) => (e.id === id ? toLocalExpense(updated) : e)),
        );

        // Refetch summary for accurate totals
        const newSummary = await userService.getExpenseSummary();
        setSummary(normalizeSummary(newSummary));

        toast.success("Expense updated successfully");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update expense";
        toast.error(message);
        throw err;
      }
    },
    [],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        const expenseToDelete = expenses.find((e) => e.id === id);
        await userService.deleteExpense(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));

        if (expenseToDelete) {
          const unpaidAmount = Math.max(
            expenseToDelete.amount - expenseToDelete.amountPaid,
            0,
          );
          setSummary((prev) => ({
            ...prev,
            total_spent: prev.total_spent - expenseToDelete.amountPaid,
            total_paid: prev.total_paid - expenseToDelete.amountPaid,
            total_unpaid: prev.total_unpaid - unpaidAmount,
            remaining_budget:
              prev.remaining_budget + expenseToDelete.amountPaid,
          }));
        }

        toast.success("Expense deleted successfully");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete expense";
        toast.error(message);
        throw err;
      }
    },
    [expenses],
  );

  const setTotalBudget = useCallback(async (newBudget: number) => {
    try {
      await userService.updateUserEvent({ totalBudget: newBudget });
      setSummary((prev) => ({
        ...prev,
        total_budget: newBudget,
        remaining_budget: newBudget - prev.total_spent,
      }));
      toast.success("Budget updated successfully");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update budget";
      toast.error(message);
      throw err;
    }
  }, []);

  const value = {
    expenses,
    isLoading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    totalBudget: summary.total_budget,
    setTotalBudget,
    totalSpent: summary.total_spent,
    remainingBudget: summary.remaining_budget,
  };

  return (
    <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
