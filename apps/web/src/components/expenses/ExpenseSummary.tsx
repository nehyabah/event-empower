import { useState } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Edit2 } from "lucide-react";

const ExpenseSummary = () => {
  const { totalBudget, setTotalBudget, totalSpent, remainingBudget } = useExpenses();
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(totalBudget);

  const percentSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleSaveBudget = () => {
    setTotalBudget(newBudget);
    setIsEditingBudget(false);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Total Budget */}
      <Card className="bg-primary/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total Budget</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsEditingBudget(!isEditingBudget)}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {isEditingBudget ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                className="text-base font-bold h-9"
              />
              <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSaveBudget}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-xl sm:text-2xl font-bold">₦{totalBudget.toLocaleString()}</p>
          )}
        </CardContent>
      </Card>

      {/* Total Spent */}
      <Card className="bg-red-50">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Spent</h3>
          <p className="text-xl sm:text-2xl font-bold">₦{totalSpent.toLocaleString()}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{ width: `${Math.min(percentSpent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{percentSpent.toFixed(0)}% of budget</p>
        </CardContent>
      </Card>

      {/* Remaining Budget */}
      <Card className={remainingBudget >= 0 ? "bg-green-50" : "bg-red-50"}>
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Remaining</h3>
          <p className={`text-xl sm:text-2xl font-bold ${remainingBudget < 0 ? "text-red-600" : ""}`}>
            ₦{remainingBudget.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {remainingBudget >= 0 ? "Within budget" : "Over budget"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseSummary;
