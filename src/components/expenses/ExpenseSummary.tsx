
import { useState } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Edit } from "lucide-react";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="bg-primary/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Total Budget</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingBudget(!isEditingBudget)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          
          {isEditingBudget ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(Number(e.target.value))}
                className="text-lg font-bold"
              />
              <Button size="sm" onClick={handleSaveBudget}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-2xl font-bold">₦{totalBudget.toLocaleString()}</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-red-50">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium mb-2">Total Spent</h3>
          <p className="text-2xl font-bold">₦{totalSpent.toLocaleString()}</p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${Math.min(percentSpent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{percentSpent.toFixed(1)}% of budget</p>
        </CardContent>
      </Card>
      
      <Card className={`${remainingBudget >= 0 ? "bg-green-50" : "bg-red-50"}`}>
        <CardContent className="p-6">
          <h3 className="text-sm font-medium mb-2">Remaining Budget</h3>
          <p className={`text-2xl font-bold ${remainingBudget < 0 ? "text-red-600" : ""}`}>
            ₦{remainingBudget.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {remainingBudget >= 0 
              ? `You're within budget!` 
              : `You're over budget by ₦${Math.abs(remainingBudget).toLocaleString()}`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseSummary;
