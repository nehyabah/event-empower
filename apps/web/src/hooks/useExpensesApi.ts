import { useState, useEffect, useCallback } from 'react';
import { userService, Expense, CreateExpenseInput, UpdateExpenseInput, ExpenseSummary, ExpenseCategory, EMPTY_EXPENSE_SUMMARY } from '@/services/api/userService';
import { toast } from 'sonner';

export function useExpensesApi() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>(EMPTY_EXPENSE_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [expensesData, summaryData] = await Promise.all([
        userService.getExpenses(),
        userService.getExpenseSummary(),
      ]);
      setExpenses(expensesData);
      setSummary(summaryData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch expenses';
      setError(message);
      console.error('Error fetching expenses:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = useCallback(async (input: CreateExpenseInput): Promise<Expense | null> => {
    try {
      const newExpense = await userService.createExpense(input);
      setExpenses(prev => [newExpense, ...prev]);
      const unpaidAmount = Math.max(newExpense.amount - newExpense.amount_paid, 0);

      // Update summary
      setSummary(prev => ({
        ...prev,
        total_spent: prev.total_spent + newExpense.amount_paid,
        total_paid: prev.total_paid + newExpense.amount_paid,
        total_unpaid: prev.total_unpaid + unpaidAmount,
        remaining_budget: prev.remaining_budget - newExpense.amount_paid,
        by_category: {
          ...prev.by_category,
          [newExpense.category]: (prev.by_category[newExpense.category] || 0) + newExpense.amount,
        },
      }));

      toast.success('Expense added successfully');
      return newExpense;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add expense';
      toast.error(message);
      console.error('Error creating expense:', err);
      return null;
    }
  }, []);

  const updateExpense = useCallback(async (id: string, input: UpdateExpenseInput): Promise<Expense | null> => {
    try {
      const oldExpense = expenses.find(e => e.id === id);
      const updatedExpense = await userService.updateExpense(id, input);
      setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));

      // Refetch summary to get accurate totals
      const newSummary = await userService.getExpenseSummary();
      setSummary(newSummary);

      toast.success('Expense updated successfully');
      return updatedExpense;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update expense';
      toast.error(message);
      console.error('Error updating expense:', err);
      return null;
    }
  }, [expenses]);

  const deleteExpense = useCallback(async (id: string): Promise<boolean> => {
    try {
      const expenseToDelete = expenses.find(e => e.id === id);
      await userService.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));

      if (expenseToDelete) {
        const unpaidAmount = Math.max(expenseToDelete.amount - expenseToDelete.amount_paid, 0);
        setSummary(prev => ({
          ...prev,
          total_spent: prev.total_spent - expenseToDelete.amount_paid,
          total_paid: prev.total_paid - expenseToDelete.amount_paid,
          total_unpaid: prev.total_unpaid - unpaidAmount,
          remaining_budget: prev.remaining_budget + expenseToDelete.amount_paid,
          by_category: {
            ...prev.by_category,
            [expenseToDelete.category]: (prev.by_category[expenseToDelete.category] || 0) - expenseToDelete.amount,
          },
        }));
      }

      toast.success('Expense deleted successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete expense';
      toast.error(message);
      console.error('Error deleting expense:', err);
      return false;
    }
  }, [expenses]);

  // Update budget (via user event)
  const updateBudget = useCallback(async (newBudget: number): Promise<boolean> => {
    try {
      await userService.updateUserEvent({ totalBudget: newBudget });
      setSummary(prev => ({
        ...prev,
        total_budget: newBudget,
        remaining_budget: newBudget - prev.total_spent,
      }));
      toast.success('Budget updated successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update budget';
      toast.error(message);
      console.error('Error updating budget:', err);
      return false;
    }
  }, []);

  // Filter helpers
  const expensesByCategory = useCallback((category: ExpenseCategory) => {
    return expenses.filter(e => e.category === category);
  }, [expenses]);

  const paidExpenses = expenses.filter(e => e.amount_paid >= e.amount);
  const unpaidExpenses = expenses.filter(e => e.amount_paid < e.amount);

  return {
    expenses,
    summary,
    isLoading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    updateBudget,
    expensesByCategory,
    paidExpenses,
    unpaidExpenses,
    totalBudget: summary.total_budget,
    totalSpent: summary.total_spent,
    remainingBudget: summary.remaining_budget,
  };
}

export default useExpensesApi;
