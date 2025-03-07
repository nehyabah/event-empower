
import { TodoItem } from "@/context/TodoContext";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface TodoItemProps {
  item: TodoItem;
  onToggle: () => void;
  onDelete: () => void;
}

const TodoItemComponent = ({ item, onToggle, onDelete }: TodoItemProps) => {
  return (
    <div className="flex items-center space-x-2 group">
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
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default TodoItemComponent;
