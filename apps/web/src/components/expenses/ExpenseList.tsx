import { Fragment, useState } from "react";
import { format } from "date-fns";
import { Calendar, ChevronDown, ChevronUp, Clock, Edit2, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Expense,
  useExpenses,
  expenseBalance,
  isExpenseOverdue,
} from "@/context/ExpenseContext";
import ExpenseForm from "./ExpenseForm";

const money = (n: number) => "₦" + n.toLocaleString();

/** Due date with an overdue/soon flag, or a dash when none is set. */
const DueDate = ({ expense }: { expense: Expense }) => {
  if (!expense.dueDate) {
    return <span className="text-muted-foreground">—</span>;
  }

  const overdue = isExpenseOverdue(expense);
  const settled = expenseBalance(expense) <= 0;

  return (
    <span
      className={
        overdue
          ? "font-medium text-red-600"
          : settled
            ? "text-muted-foreground"
            : "text-foreground"
      }
    >
      {format(expense.dueDate, "MMM d, yyyy")}
      {overdue && <span className="ml-1.5 text-xs font-semibold uppercase">Overdue</span>}
    </span>
  );
};

// Mobile Expense Card
const ExpenseCard = ({
  expense,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  readOnly,
}: {
  expense: Expense;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  readOnly: boolean;
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
            <p className="text-lg font-semibold">{money(expense.amount)}</p>

            {/* Balance owed — the number couples actually chase */}
            {expenseBalance(expense) > 0 && (
              <p className="text-sm mt-0.5">
                <span className="text-muted-foreground">Balance </span>
                <span className={`font-semibold ${isExpenseOverdue(expense) ? "text-red-600" : "text-amber-600"}`}>
                  {money(expenseBalance(expense))}
                </span>
              </p>
            )}

            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {getCategoryLabel(expense.category)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(expense.date), "MMM d, yyyy")}
              </span>
              {expense.dueDate && (
                <span className={`flex items-center gap-1 ${isExpenseOverdue(expense) ? "text-red-600 font-medium" : ""}`}>
                  <Clock className="h-3 w-3" />
                  Due {format(expense.dueDate, "MMM d")}
                  {isExpenseOverdue(expense) && " · overdue"}
                </span>
              )}
            </div>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
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
  const { expenses, deleteExpense, readOnly } = useExpenses();
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
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-hidden rounded-lg border shadow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
              <th className="px-4 py-3 text-right font-medium">Paid</th>
              <th className="px-4 py-3 text-right font-medium">Balance</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Due</th>
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
                    <td className="px-4 py-3 text-right tabular-nums">{money(expense.amount)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {money(expense.amountPaid)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {expenseBalance(expense) > 0 ? (
                        <span className={`font-semibold ${isExpenseOverdue(expense) ? "text-red-600" : "text-amber-600"}`}>
                          {money(expenseBalance(expense))}
                        </span>
                      ) : (
                        <span className="text-emerald-600">Settled</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getCategoryLabel(expense.category)}</td>
                    <td className="px-4 py-3"><DueDate expense={expense} /></td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-1">
                        {readOnly ? <span className="text-xs text-muted-foreground">—</span> : <>
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
                        </>}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-t bg-muted/20">
                      <td colSpan={8} className="px-4 py-4">
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
