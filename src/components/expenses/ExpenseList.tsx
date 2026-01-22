
import { Fragment, useState } from "react";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Expense, useExpenses } from "@/context/ExpenseContext";
import ExpenseForm from "./ExpenseForm";

const ExpenseList = () => {
  const { expenses, deleteExpense } = useExpenses();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id);
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getPaymentStatus = (expense: Expense) => {
    if (expense.amount > 0 && expense.amountPaid >= expense.amount) {
      return { label: "Paid", className: "bg-green-100 text-green-800" };
    }
    if (expense.amountPaid > 0) {
      return { label: "Partial", className: "bg-blue-100 text-blue-800" };
    }
    return { label: "Pending", className: "bg-yellow-100 text-yellow-800" };
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No expenses added yet.</p>
      </div>
    );
  }

  const getNoteItems = (expense: Expense) =>
    (expense.notes || "")
      .split(/\r?\n/)
      .map((note) => note.trim())
      .filter(Boolean);

  return (
    <>
      <div className="overflow-hidden rounded-lg border shadow">
        <TooltipProvider>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Category</th>
              <th className="px-4 py-3 text-left font-medium hidden md:table-cell">Date</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => {
              const isExpanded = expandedExpenseId === expense.id;
              const noteItems = getNoteItems(expense);
              return (
                <Fragment key={expense.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <tr
                        className="border-t hover:bg-muted/30 cursor-pointer"
                        onClick={() =>
                          setExpandedExpenseId(isExpanded ? null : expense.id)
                        }
                      >
                        <td className="px-4 py-3">{expense.name}</td>
                        <td className="px-4 py-3">₦{expense.amount.toLocaleString()}</td>
                        <td className="px-4 py-3 hidden md:table-cell">{getCategoryLabel(expense.category)}</td>
                        <td className="px-4 py-3 hidden md:table-cell">{format(new Date(expense.date), "MMM d, yyyy")}</td>
                        <td className="px-4 py-3">
                          {(() => {
                            const status = getPaymentStatus(expense);
                            return (
                              <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>
                                {status.label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEdit(expense);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleDelete(expense.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    </TooltipTrigger>
                    <TooltipContent side="top">Click to view comments/notes</TooltipContent>
                  </Tooltip>
                  {isExpanded && (
                    <tr className="border-t bg-muted/20">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="text-sm font-medium mb-3">Notes</div>
                        {noteItems.length === 0 ? (
                          <div className="rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                            No notes for this expense yet.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {noteItems.map((note, index) => (
                              <div key={`${expense.id}-${index}`} className="flex">
                                <div className="rounded-2xl bg-muted/60 px-4 py-2 text-sm text-foreground shadow-sm">
                                  {note}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
        </TooltipProvider>
      </div>

      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm
              expense={editingExpense}
              onCancel={() => setEditingExpense(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExpenseList;
