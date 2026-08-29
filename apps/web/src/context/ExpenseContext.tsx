import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { parseDateOnly, toDateInput } from "@/lib/dates";
import {
  userService,
  Expense as ApiExpense,
  ExpenseCategory,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseSummary,
  EMPTY_EXPENSE_SUMMARY,
} from "@/services/api/userService";
import { toast } from "sonner";
import plannerService from "@/services/api/plannerService";

export type { ExpenseCategory };

// Re-export the Expense type with a date field for backward compatibility
export interface Expense {
  id: string;
  name: string;
  amount: number;
  amountPaid: number;
  category: ExpenseCategory;
  date: Date;
  /** When the outstanding balance is due; null when no date was set. */
  dueDate: Date | null;
  paid: boolean;
  notes?: string;
  /** The roster vendor this expense was paid to, if any. */
  vendorId?: string | null;
  /** Resolved server-side; display only. */
  vendorName?: string | null;
}

/** What is still owed on an expense. */
export const expenseBalance = (expense: Expense): number =>
  Math.max(expense.amount - expense.amountPaid, 0);

/** True when money is still owed and the due date has passed. */
export const isExpenseOverdue = (expense: Expense): boolean => {
  if (!expense.dueDate || expenseBalance(expense) <= 0) return false;
  const endOfDue = new Date(expense.dueDate);
  endOfDue.setHours(23, 59, 59, 999);
  return endOfDue < new Date();
};

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
  /** Total still owed across every expense. */
  totalOwed: number;
  overdueTotal: number;
  overdueCount: number;
  nextDue: ExpenseSummary["next_due"];
  refresh: () => Promise<void>;
  /** True when viewing someone else's budget — hides every edit control. */
  readOnly: boolean;
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
  total_committed: toNumber(data.total_committed),
  overdue_total: toNumber(data.overdue_total),
  overdue_count: toNumber(data.overdue_count),
  due_soon_total: toNumber(data.due_soon_total),
  next_due: data.next_due
    ? { ...data.next_due, balance: toNumber(data.next_due.balance) }
    : null,
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
  // Date-only columns: anchor to local midnight so the day never shifts.
  date: parseDateOnly(apiExpense.expense_date) ?? new Date(),
  dueDate: parseDateOnly(apiExpense.due_date),
  paid: apiExpense.paid,
  notes: apiExpense.notes || undefined,
  vendorId: apiExpense.vendor_id || undefined,
  vendorName: apiExpense.vendor_name || undefined,
});

interface ExpenseProviderProps {
  children: ReactNode;
  /**
   * View a planner client's budget instead of your own. The figures are the
   * same ones the couple sees — same endpoint composition, same maths — but
   * presented read-only.
   */
  clientId?: string;
}

export const ExpenseProvider = ({ children, clientId }: ExpenseProviderProps) => {
  const readOnly = Boolean(clientId);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>(EMPTY_EXPENSE_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      // Only the first load blanks the screen; background refreshes swap the
      // data in place so the page never flickers.
      if (!hasLoadedRef.current) setIsLoading(true);
      const [expensesData, summaryData] = clientId
        ? await plannerService.getClientExpenses(clientId).then((d) => [d.expenses, d.summary] as const)
        : await Promise.all([
            userService.getExpenses(),
            userService.getExpenseSummary(),
          ]);
      setExpenses(expensesData.map(toLocalExpense));
      setSummary(normalizeSummary(summaryData));
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch expenses";
      // A failed refresh keeps the last good figures on screen.
      if (!hasLoadedRef.current) setError(message);
      console.error("Error fetching expenses:", err);
    } finally {
      hasLoadedRef.current = true;
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Budgets are edited by both partners and by the planner, so keep them live.
  useAutoRefresh(fetchData);

  const addExpense = useCallback(async (expense: Omit<Expense, "id">) => {
    try {
      const input: CreateExpenseInput = {
        name: expense.name,
        amount: expense.amount,
        amountPaid: expense.amountPaid,
        category: expense.category,
        date: toDateInput(expense.date) ?? undefined,
        dueDate: toDateInput(expense.dueDate),
        paid: expense.paid,
        notes: expense.notes,
        vendorId: expense.vendorId || undefined,
      };

      const newExpense = await userService.createExpense(input);
      setExpenses((prev) => [...prev, toLocalExpense(newExpense)]);

      // Re-read the summary rather than patching it locally: overdue and
      // next-due figures depend on dates the client would have to re-derive.
      setSummary(normalizeSummary(await userService.getExpenseSummary()));

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
          input.date = toDateInput(updatedExpense.date);
        if (updatedExpense.dueDate !== undefined)
          input.dueDate = toDateInput(updatedExpense.dueDate);
        if (updatedExpense.paid !== undefined) input.paid = updatedExpense.paid;
        if (updatedExpense.notes !== undefined)
          input.notes = updatedExpense.notes;
        if (updatedExpense.vendorId !== undefined)
          input.vendorId = updatedExpense.vendorId || undefined;

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
        await userService.deleteExpense(id);
        setExpenses((prev) => prev.filter((e) => e.id !== id));

        // Overdue/next-due totals depend on dates, so re-read rather than
        // adjusting the summary by hand.
        setSummary(normalizeSummary(await userService.getExpenseSummary()));

        toast.success("Expense deleted successfully");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to delete expense";
        toast.error(message);
        throw err;
      }
    },
    [],
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
    totalOwed: summary.total_unpaid,
    overdueTotal: summary.overdue_total,
    overdueCount: summary.overdue_count,
    nextDue: summary.next_due,
    refresh: fetchData,
    readOnly,
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
