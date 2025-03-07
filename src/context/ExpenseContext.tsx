
import { createContext, useContext, useState, ReactNode } from "react";

export type ExpenseCategory = 
  | "venue" 
  | "catering" 
  | "attire" 
  | "decoration" 
  | "photography" 
  | "music" 
  | "transportation" 
  | "accommodation" 
  | "invitations" 
  | "rings" 
  | "gifts" 
  | "beauty" 
  | "other";

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  paid: boolean;
  notes?: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  totalBudget: number;
  setTotalBudget: (budget: number) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Sample initial expenses for demo purposes
const initialExpenses: Expense[] = [
  {
    id: "1",
    name: "Wedding Venue",
    amount: 5000,
    category: "venue",
    date: new Date(2024, 5, 10),
    paid: true,
  },
  {
    id: "2",
    name: "Catering Deposit",
    amount: 2000,
    category: "catering",
    date: new Date(2024, 3, 15),
    paid: true,
  },
  {
    id: "3",
    name: "Wedding Dress",
    amount: 1500,
    category: "attire",
    date: new Date(2024, 4, 20),
    paid: false,
  },
  {
    id: "4",
    name: "Photographer",
    amount: 1800,
    category: "photography",
    date: new Date(2024, 4, 5),
    paid: false,
  },
];

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [totalBudget, setTotalBudget] = useState<number>(15000);

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, ...updatedExpense } : expense
      )
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id));
  };

  const value = {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    totalBudget,
    setTotalBudget,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
