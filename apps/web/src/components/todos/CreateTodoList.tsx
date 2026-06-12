
import { useState } from "react";
import { useTodo } from "@/context/TodoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Lock, Users } from "lucide-react";

interface CreateTodoListProps {
  onCancel: () => void;
}

const CreateTodoList = ({ onCancel }: CreateTodoListProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isShared, setIsShared] = useState(false);
  const { createTodoList, hasPlanner } = useTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createTodoList(title.trim(), description.trim() || undefined, isShared);
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">List Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Wedding Venue Checklist"
          className="mt-1"
          autoFocus
        />
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a brief description of this checklist..."
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        {isShared ? (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Shared with planner</p>
              <p className="text-xs text-muted-foreground">Your planner can view and update items</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Private</p>
              <p className="text-xs text-muted-foreground">Only you and your partner can see this</p>
            </div>
          </div>
        )}
        <Switch
          checked={isShared}
          onCheckedChange={setIsShared}
          disabled={!hasPlanner}
          title={!hasPlanner ? "Connect a planner to enable sharing" : undefined}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          Create List
        </Button>
      </div>
    </form>
  );
};

export default CreateTodoList;
