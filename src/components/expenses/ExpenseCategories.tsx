
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent } from "@/components/ui/card";

const ExpenseCategories = () => {
  const { expenses } = useExpenses();

  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = {
        total: 0,
        count: 0,
        paid: 0,
      };
    }
    
    acc[expense.category].total += expense.amount;
    acc[expense.category].count += 1;
    acc[expense.category].paid += expense.amountPaid;
    
    return acc;
  }, {} as Record<string, { total: number; count: number; paid: number }>);

  // Sort categories by total amount (highest first)
  const sortedCategories = Object.entries(expensesByCategory).sort(
    (a, b) => b[1].total - a[1].total
  );

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (sortedCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No expense data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCategories.map(([category, data]) => {
          const percentage = totalAmount > 0 ? (data.total / totalAmount) * 100 : 0;
          const paidPercentage = data.total > 0 ? (data.paid / data.total) * 100 : 0;
          
          return (
            <Card key={category} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{getCategoryLabel(category)}</h3>
                    <p className="text-2xl font-bold">₦{data.total.toLocaleString()}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {percentage.toFixed(1)}% of total
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Payment Progress</span>
                    <span>{paidPercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${paidPercentage}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-2 text-sm text-muted-foreground">
                  {data.count} expense{data.count !== 1 ? "s" : ""}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseCategories;
