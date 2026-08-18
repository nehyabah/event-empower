import { useMemo, useState } from "react";
import { TodoListItem, useTodo } from "@/context/TodoContext";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, MoreVertical, PlusCircle, Trash2, Users } from "lucide-react";
import TodoItemComponent from "./TodoItem";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TodoListCardProps {
  todoList: TodoListItem;
}

const TodoListCard = ({ todoList }: TodoListCardProps) => {
  const {
    deleteTodoList,
    updateTodoList,
    toggleTodoItem,
    deleteTodoItem,
    addTodoItem,
    updateTodoItem,
    reorderTodoItems,
    setAllCompleted,
    clearCompleted,
    hasPlanner,
  } = useTodo();
  const [newItemText, setNewItemText] = useState("");
  const [itemFilter, setItemFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const completedItems = todoList.items.filter(item => item.completed).length;
  const totalItems = todoList.items.length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleAddItem = () => {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    const status = itemFilter === "all" ? "todo" : itemFilter;
    addTodoItem(todoList.id, trimmed, status);
    setNewItemText("");
  };

  const handleMarkCompleted = () => {
    updateTodoList(todoList.id, { isCompleted: !todoList.isCompleted });
  };

  const handleToggleShared = () => {
    updateTodoList(todoList.id, { isShared: !todoList.isShared });
  };

  const handleStatusChange = (itemId: string, status: "todo" | "in_progress" | "done") => {
    updateTodoItem(todoList.id, itemId, {
      status,
      completed: status === "done",
    });
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, itemId: string) => {
    event.dataTransfer.setData("text/plain", itemId);
    setDraggingId(itemId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDropOnItem = (event: React.DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;
    const orderedIds = reorderIds(todoList.items, sourceId, targetId);
    reorderTodoItems(todoList.id, orderedIds);
  };


  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredItems = useMemo(() => {
    return todoList.items
      .filter(item => {
        const matchesFilter = itemFilter === "all" ? true : item.status === itemFilter;
        return matchesFilter;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [itemFilter, todoList.items]);

  const filterOptions = [
    { id: "all", label: "All", shortLabel: "All" },
    { id: "todo", label: "To do", shortLabel: "To do" },
    { id: "in_progress", label: "In progress", shortLabel: "Doing" },
    { id: "done", label: "Done", shortLabel: "Done" },
  ];

  return (
    <>
      <Card className={`flex flex-col ${todoList.isCompleted ? 'bg-muted/50' : ''}`}>
        <CardHeader className="pb-3 px-4 sm:px-6">
          {/* Title and Menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-medium truncate">{todoList.title}</h3>
                {todoList.isShared ? (
                  <Badge variant="secondary" className="gap-1 text-xs shrink-0">
                    <Users className="h-3 w-3" />
                    Shared
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-xs shrink-0 text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                )}
              </div>
              {todoList.description && (
                <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 line-clamp-2">
                  {todoList.description}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMarkCompleted}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {todoList.isCompleted ? "Mark as Active" : "Mark as Completed"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleShared} disabled={!hasPlanner && !todoList.isShared}>
                  {todoList.isShared ? (
                    <><Lock className="mr-2 h-4 w-4" />Make private</>
                  ) : (
                    <><Users className="mr-2 h-4 w-4" />Share with planner</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAllCompleted(todoList.id, true)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark all done
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAllCompleted(todoList.id, false)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark all active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => clearCompleted(todoList.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear completed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5 mt-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{completedItems}/{totalItems}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 px-4 sm:px-6 pb-4">
          {/* Filter - Segmented Control */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-muted/60 rounded-lg mb-4">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setItemFilter(filter.id as typeof itemFilter)}
                className={`px-2 py-1.5 text-xs font-medium rounded-md transition-all ${
                  itemFilter === filter.id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Add Task Input */}
          <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 mb-4">
            <PlusCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              value={newItemText}
              onChange={(event) => setNewItemText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddItem();
                }
              }}
              placeholder="Add a task..."
              className="flex-1 bg-transparent text-sm outline-none min-w-0"
            />
            <Button
              size="sm"
              onClick={handleAddItem}
              disabled={!newItemText.trim()}
              className="h-7 px-2 text-xs shrink-0"
            >
              Add
            </Button>
          </div>

          {/* Task List */}
          <div className="space-y-2 max-h-[280px] sm:max-h-[320px] overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <TodoItemComponent
                  key={item.id}
                  item={item}
                  onToggle={() => toggleTodoItem(todoList.id, item.id)}
                  onDelete={() => deleteTodoItem(todoList.id, item.id)}
                  onStatusChange={(status) => handleStatusChange(item.id, status)}
                  onDueDateChange={(dueDate) => updateTodoItem(todoList.id, item.id, { dueDate })}
                  draggable
                  isDragging={draggingId === item.id}
                  onDragStart={(event) => handleDragStart(event, item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDropOnItem(event, item.id)}
                  onDragEnd={handleDragEnd}
                />
              ))
            ) : (
              <p className="text-center py-6 text-sm text-muted-foreground">
                No tasks yet. Add one above!
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="border-t pt-3 pb-3 px-4 sm:px-6">
          <div className="text-xs text-muted-foreground">
            Created {formatDate(todoList.createdAt)}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this list?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{todoList.title}" and all of its items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTodoList(todoList.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TodoListCard;

const reorderIds = (items: { id: string; sortOrder: number }[], sourceId: string, targetId: string) => {
  const ordered = [...items].sort((a, b) => a.sortOrder - b.sortOrder).map(item => item.id);
  const sourceIndex = ordered.indexOf(sourceId);
  const targetIndex = ordered.indexOf(targetId);
  if (sourceIndex === -1 || targetIndex === -1) return ordered;
  ordered.splice(sourceIndex, 1);
  ordered.splice(targetIndex, 0, sourceId);
  return ordered;
};
