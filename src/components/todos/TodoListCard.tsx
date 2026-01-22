
import { useMemo, useState } from "react";
import { TodoListItem, useTodo } from "@/context/TodoContext";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, LayoutGrid, List, MoreVertical, PlusCircle, Trash2 } from "lucide-react";
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
  } = useTodo();
  const [newItemText, setNewItemText] = useState("");
  const [itemFilter, setItemFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
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

  const handleDropOnColumn = (event: React.DragEvent<HTMLDivElement>, status: "todo" | "in_progress" | "done") => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain");
    if (!sourceId) return;
    const targetItems = todoList.items.filter(item => item.status === status && item.id !== sourceId);
    const maxOrder = targetItems.length > 0 ? Math.max(...targetItems.map(item => item.sortOrder)) : -1;
    updateTodoItem(todoList.id, sourceId, {
      status,
      completed: status === "done",
      sortOrder: maxOrder + 1,
    });
  };

  const handleDropOnBoardItem = (
    event: React.DragEvent<HTMLDivElement>,
    targetId: string,
    targetStatus: "todo" | "in_progress" | "done"
  ) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;
    updateTodoItem(todoList.id, sourceId, {
      status: targetStatus,
      completed: targetStatus === "done",
    });
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

  const columns: { id: "todo" | "in_progress" | "done"; label: string }[] = [
    { id: "todo", label: "To do" },
    { id: "in_progress", label: "In progress" },
    { id: "done", label: "Done" },
  ];
  
  return (
    <>
      <Card className={`${todoList.isCompleted ? 'bg-muted/50' : ''}`}>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-lg font-medium">{todoList.title}</h3>
              {todoList.description && (
                <p className="text-muted-foreground text-sm mt-1">{todoList.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "board" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("board")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleMarkCompleted}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {todoList.isCompleted ? "Mark as Active" : "Mark as Completed"}
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
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span>{completedItems} of {totalItems} items</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "All" },
                { id: "todo", label: "To do" },
                { id: "in_progress", label: "In progress" },
                { id: "done", label: "Done" },
              ].map((filter) => (
                <Button
                  key={filter.id}
                  variant={itemFilter === filter.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setItemFilter(filter.id as typeof itemFilter)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
              <PlusCircle className="h-4 w-4 text-muted-foreground" />
              <input
                value={newItemText}
                onChange={(event) => setNewItemText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleAddItem();
                  }
                }}
                placeholder="Add a task and hit Enter..."
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <Button size="sm" onClick={handleAddItem} disabled={!newItemText.trim()}>
                Add
              </Button>
            </div>
          </div>

          {viewMode === "list" ? (
            <div className="mt-6 space-y-2">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <TodoItemComponent
                    key={item.id}
                    item={item}
                    onToggle={() => toggleTodoItem(todoList.id, item.id)}
                    onDelete={() => deleteTodoItem(todoList.id, item.id)}
                    onStatusChange={(status) => handleStatusChange(item.id, status)}
                    draggable
                    isDragging={draggingId === item.id}
                    onDragStart={(event) => handleDragStart(event, item.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDropOnItem(event, item.id)}
                    onDragEnd={handleDragEnd}
                  />
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  No tasks match this filter yet.
                </p>
              )}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {columns.map((column) => {
                const columnItems = todoList.items
                  .filter(item => item.status === column.id)
                  .sort((a, b) => a.sortOrder - b.sortOrder);
                return (
                  <div
                    key={column.id}
                    className="rounded-lg border bg-muted/20 p-3"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDropOnColumn(event, column.id)}
                  >
                    <div className="flex items-center justify-between text-sm font-medium mb-3">
                      <span>{column.label}</span>
                      <span className="text-muted-foreground">{columnItems.length}</span>
                    </div>
                    <div className="space-y-2">
                      {columnItems.length > 0 ? (
                        columnItems.map(item => (
                          <TodoItemComponent
                            key={item.id}
                            item={item}
                            onToggle={() => toggleTodoItem(todoList.id, item.id)}
                            onDelete={() => deleteTodoItem(todoList.id, item.id)}
                            onStatusChange={(status) => handleStatusChange(item.id, status)}
                            draggable
                            isDragging={draggingId === item.id}
                            onDragStart={(event) => handleDragStart(event, item.id)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => handleDropOnBoardItem(event, item.id, column.id)}
                            onDragEnd={handleDragEnd}
                          />
                        ))
                      ) : (
                        <div className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
                          Drag tasks here
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <div className="text-xs text-muted-foreground">
            Created {formatDate(todoList.createdAt)}
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{todoList.title}" and all of its items.
              This action cannot be undone.
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
