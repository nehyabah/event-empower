
import { useState } from "react";
import { TodoListItem, useTodo } from "@/context/TodoContext";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, MoreVertical, PlusCircle, Trash2, Edit } from "lucide-react";
import TodoItemComponent from "./TodoItem";
import AddTodoItem from "./AddTodoItem";
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
  const { deleteTodoList, updateTodoList, toggleTodoItem, deleteTodoItem, addTodoItem } = useTodo();
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const completedItems = todoList.items.filter(item => item.completed).length;
  const totalItems = todoList.items.length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  const handleAddItem = (text: string) => {
    addTodoItem(todoList.id, text);
    setIsAddingItem(false);
  };
  
  const handleMarkCompleted = () => {
    updateTodoList(todoList.id, { isCompleted: !todoList.isCompleted });
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <>
      <Card className={`${todoList.isCompleted ? 'bg-muted/50' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{todoList.title}</h3>
              {todoList.description && (
                <p className="text-muted-foreground text-sm mt-1">{todoList.description}</p>
              )}
            </div>
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
                <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span>{completedItems} of {totalItems} items</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            {todoList.items.length > 0 ? (
              todoList.items.map(item => (
                <TodoItemComponent
                  key={item.id}
                  item={item}
                  onToggle={() => toggleTodoItem(todoList.id, item.id)}
                  onDelete={() => deleteTodoItem(todoList.id, item.id)}
                />
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                No items yet. Add your first item to get started.
              </p>
            )}
          </div>
          
          {isAddingItem ? (
            <div className="mt-4">
              <AddTodoItem 
                onAdd={handleAddItem} 
                onCancel={() => setIsAddingItem(false)} 
              />
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <div className="text-xs text-muted-foreground">
            Created {formatDate(todoList.createdAt)}
          </div>
          {!isAddingItem && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsAddingItem(true)}
              className="gap-1 text-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Item
            </Button>
          )}
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
