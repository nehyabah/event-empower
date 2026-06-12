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
        <div className="min-h-screen bg-background pt-20 pb-16">
          <div className="container max-w-3xl px-4">

            {/* Header */}
            <div className="mb-6 pt-4 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight">
                  Budget
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Track every naira, see where it goes
                </p>
              </div>
              <Button onClick={() => setIsAddingExpense(true)} className="gap-2 shrink-0" size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {/* Summary */}
            <ExpenseSummary />

            {/* Add Expense Form */}
            {isAddingExpense && (
              <div className="bg-card rounded-xl p-5 shadow-sm border mt-5">
                <ExpenseForm onCancel={() => setIsAddingExpense(false)} />
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full mt-6">
              <TabsList className="grid grid-cols-2 w-full sm:w-64 mb-5 h-9 p-1 bg-muted/60 rounded-lg">
                <TabsTrigger value="all" className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  All Expenses
                </TabsTrigger>
                <TabsTrigger value="categories" className="text-xs sm:text-sm rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  By Category
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
