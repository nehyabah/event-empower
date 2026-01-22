
import { TodoItem } from "@/context/TodoContext";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface TodoItemProps {
  item: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
  onStatusChange?: (status: TodoItem["status"]) => void;
  draggable?: boolean;
  isDragging?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (event: React.DragEvent<HTMLDivElement>) => void;
}

const TodoItemComponent = ({
  item,
  onToggle,
  onDelete,
  onStatusChange,
  draggable,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: TodoItemProps) => {
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
      item.status === "todo"
        ? "in_progress"
        : item.status === "in_progress"
          ? "done"
          : "todo";
    onStatusChange(nextStatus);
  };

  return (
    <div
      className={`flex items-center space-x-2 group p-2 border rounded-md transition ${isDragging ? "opacity-50 bg-muted" : "hover:bg-background"}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <Checkbox 
        id={item.id} 
        checked={item.completed} 
        onCheckedChange={onToggle}
      />
      <label
        htmlFor={item.id} 
        className={`flex-grow cursor-pointer ${item.completed ? 'line-through text-muted-foreground' : ''}`}
      >
        {item.text}
      </label>
      <button
        type="button"
        onClick={handleStatusClick}
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses}`}
      >
        {statusLabel}
      </button>
      <button 
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive"
        aria-label="Delete todo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default TodoItemComponent;
