
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddTodoItemProps {
  onAdd: (text: string) => void;
  onCancel: () => void;
}

const AddTodoItem = ({ onAdd, onCancel }: AddTodoItemProps) => {
  const [text, setText] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText("");
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter a new task..."
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!text.trim()}>
          Add
        </Button>
      </div>
    </form>
  );
};

export default AddTodoItem;
