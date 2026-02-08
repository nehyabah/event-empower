import { Fragment, useState } from "react";
import { format } from "date-fns";
import { Calendar, ChevronDown, ChevronUp, Edit2, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Expense, useExpenses } from "@/context/ExpenseContext";
import ExpenseForm from "./ExpenseForm";

// Mobile Expense Card
const ExpenseCard = ({
  expense,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const status = getPaymentStatus(expense);
  const noteItems = getNoteItems(expense);

  return (
    <div className="border rounded-lg bg-card">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{expense.name}</span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${status.className}`}>
                {status.label}
              </span>
            </div>
            <p className="text-lg font-semibold">₦{expense.amount.toLocaleString()}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {getCategoryLabel(expense.category)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(expense.date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expand toggle for notes */}
        {noteItems.length > 0 && (
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-1 text-xs text-muted-foreground mt-3 hover:text-foreground"
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {noteItems.length} note{noteItems.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Expanded notes */}
      {isExpanded && noteItems.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t bg-muted/20">
          <div className="space-y-2">
            {noteItems.map((note, index) => (
              <div key={index} className="rounded-lg bg-background px-3 py-2 text-sm">
                {note}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
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

const getNoteItems = (expense: Expense) =>
  (expense.notes || "")
    .split(/\r?\n/)
    .map((note) => note.trim())
    .filter(Boolean);

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

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No expenses added yet.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            isExpanded={expandedExpenseId === expense.id}
            onToggleExpand={() =>
              setExpandedExpenseId(expandedExpenseId === expense.id ? null : expense.id)
            }
            onEdit={() => handleEdit(expense)}
            onDelete={() => handleDelete(expense.id)}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-hidden rounded-lg border shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => {
              const isExpanded = expandedExpenseId === expense.id;
              const noteItems = getNoteItems(expense);
              const status = getPaymentStatus(expense);

              return (
                <Fragment key={expense.id}>
                  <tr
                    className="border-t hover:bg-muted/30 cursor-pointer"
                    onClick={() => setExpandedExpenseId(isExpanded ? null : expense.id)}
                  >
                    <td className="px-4 py-3">{expense.name}</td>
                    <td className="px-4 py-3">₦{expense.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">{getCategoryLabel(expense.category)}</td>
                    <td className="px-4 py-3">{format(new Date(expense.date), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(expense);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(expense.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-t bg-muted/20">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="text-sm font-medium mb-3">Notes</div>
                        {noteItems.length === 0 ? (
                          <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                            No notes for this expense.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {noteItems.map((note, index) => (
                              <div key={index} className="rounded-lg bg-background px-4 py-2 text-sm shadow-sm">
                                {note}
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
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="sm:max-w-md">
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
