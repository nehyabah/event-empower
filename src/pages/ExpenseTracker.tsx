import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ExpenseList from "@/components/expenses/ExpenseList";
import ExpenseForm from "@/components/expenses/ExpenseForm";
import ExpenseSummary from "@/components/expenses/ExpenseSummary";
import ExpenseCategories from "@/components/expenses/ExpenseCategories";
import { ExpenseProvider } from "@/context/ExpenseContext";
import Navbar from "@/components/layout/Navbar";

const ExpenseTracker = () => {
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  return (
    <>
      <Navbar />
      <ExpenseProvider>
        <div className="min-h-screen bg-background pt-20 pb-12">
          <div className="container max-w-5xl px-4">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight mb-1">
                Wedding Budget
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Track and manage your expenses
              </p>
            </div>

            {/* Summary Cards */}
            <ExpenseSummary />

            {/* Add Expense Button */}
            <div className="flex justify-between items-center mt-6 mb-4">
              <h2 className="text-lg sm:text-xl font-serif">Expenses</h2>
              <Button
                onClick={() => setIsAddingExpense(true)}
                className="gap-2"
                size="sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {/* Add Expense Form */}
            {isAddingExpense && (
              <div className="bg-card rounded-lg p-4 sm:p-6 shadow-sm border mb-6">
                <ExpenseForm onCancel={() => setIsAddingExpense(false)} />
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-grid mb-6 h-9 p-1 bg-muted/60 rounded-lg">
                <TabsTrigger
                  value="all"
                  className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  All Expenses
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Categories
                </TabsTrigger>
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
    </>
  );
};

export default ExpenseTracker;
