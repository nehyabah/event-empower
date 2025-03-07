
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import ExpenseSummary from "@/components/expenses/ExpenseSummary";
import ExpenseCategories from "@/components/expenses/ExpenseCategories";
import { ExpenseProvider } from "@/context/ExpenseContext";

const ExpenseTracker = () => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  return (
    <ExpenseProvider>
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-5xl">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight mb-2">Wedding Budget</h1>
            <p className="text-muted-foreground">Track and manage your wedding expenses</p>
          </div>

          <ExpenseSummary />

          <div className="flex justify-between items-center mt-8 mb-4">
            <h2 className="text-2xl font-serif">Expenses</h2>
            <Button onClick={() => setIsAddingExpense(true)} className="gap-1">
              <Plus size={18} />
              Add Expense
            </Button>
          </div>

          {isAddingExpense ? (
            <div className="bg-card rounded-lg p-6 shadow-sm mb-8">
              <ExpenseForm onCancel={() => setIsAddingExpense(false)} />
            </div>
          ) : null}

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Expenses</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ExpenseList />
            </TabsContent>
            <TabsContent value="categories">
              <ExpenseCategories />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ExpenseProvider>
  );
};

export default ExpenseTracker;
