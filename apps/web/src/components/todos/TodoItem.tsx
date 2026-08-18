
import { useState } from "react";
import { TodoItem } from "@/context/TodoContext";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, X } from "lucide-react";

interface TodoItemProps {
  item: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
  onStatusChange?: (status: TodoItem["status"]) => void;
  onDueDateChange?: (dueDate: string | null) => void;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
}

const formatDueDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const isOverdue = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

const TodoItemComponent = ({
  item,
  onToggle,
  onDelete,
  onStatusChange,
  onDueDateChange,
  draggable,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: TodoItemProps) => {
  const [showDateInput, setShowDateInput] = useState(false);

  const statusLabel = item.status === "in_progress" ? "In progress" : item.status === "done" ? "Done" : "To do";
  const statusClasses =
    item.status === "done"
      ? "bg-green-100 text-green-700"
      : item.status === "in_progress"
        ? "bg-amber-100 text-amber-700"
        : "bg-blue-100 text-blue-700";

  const handleStatusClick = () => {
    if (!onStatusChange) return;
    const nextStatus =
      item.status === "todo" ? "in_progress" : item.status === "in_progress" ? "done" : "todo";
    onStatusChange(nextStatus);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value || null;
    onDueDateChange?.(val);
    setShowDateInput(false);
  };

  const overdue = item.dueDate && !item.completed && isOverdue(item.dueDate);

  return (
    <div
      className={`group p-2 border rounded-md transition ${isDragging ? "opacity-50 bg-muted" : "hover:bg-background"}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center space-x-2">
        <Checkbox
          id={item.id}
          checked={item.completed}
          onCheckedChange={onToggle}
        />
        <label
          htmlFor={item.id}
          className={`flex-grow cursor-pointer text-sm ${item.completed ? "line-through text-muted-foreground" : ""}`}
        >
          {item.text}
        </label>
        <button
          type="button"
          onClick={handleStatusClick}
          className={`rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${statusClasses}`}
        >
          {statusLabel}
        </button>
        {onDueDateChange && (
          <button
            type="button"
            onClick={() => setShowDateInput(v => !v)}
            className={`opacity-0 group-hover:opacity-100 transition shrink-0 ${item.dueDate ? "opacity-100" : ""} ${overdue ? "text-destructive" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="Set due date"
          >
            <Calendar className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive shrink-0"
          aria-label="Delete todo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Due date display */}
      {item.dueDate && !showDateInput && (
        <div className={`flex items-center gap-1 mt-1 ml-6 text-xs ${overdue && !item.completed ? "text-destructive" : "text-muted-foreground"}`}>
          <Calendar className="h-3 w-3" />
          <span>{formatDueDate(item.dueDate)}</span>
          {onDueDateChange && (
            <button
              type="button"
              onClick={() => onDueDateChange(null)}
              className="ml-1 hover:text-destructive transition"
              aria-label="Remove due date"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Inline date picker */}
      {showDateInput && onDueDateChange && (
        <div className="mt-1 ml-6">
          <input
            type="date"
            defaultValue={item.dueDate ?? ""}
            onChange={handleDateChange}
            onBlur={() => setShowDateInput(false)}
            autoFocus
            className="text-xs border rounded px-1.5 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
    </div>
  );
};

export default TodoItemComponent;
