
import { useTodo, TodoListItem } from "@/context/TodoContext";
import TodoListCard from "./TodoListCard";
import { PlusCircle } from "lucide-react";

interface TodoListProps {
  filter: "all" | "active" | "completed";
  searchQuery: string;
}

const TodoList = ({ filter, searchQuery }: TodoListProps) => {
  const { todoLists } = useTodo();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  
  const filteredLists = todoLists.filter(list => {
    if (filter === "all") return true;
    if (filter === "active") return !list.isCompleted;
    if (filter === "completed") return list.isCompleted;
    return true;
  }).filter(list => {
    if (!normalizedQuery) return true;
    return (
      list.title.toLowerCase().includes(normalizedQuery) ||
      (list.description || "").toLowerCase().includes(normalizedQuery)
    );
  });
  
  if (filteredLists.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <PlusCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No todo lists found</h3>
        <p className="text-muted-foreground">
          {filter === "all" 
            ? "Create your first todo list to get started" 
            : filter === "active" 
              ? "No active todo lists" 
              : "No completed todo lists"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filteredLists.map((list: TodoListItem) => (
        <TodoListCard key={list.id} todoList={list} />
      ))}
    </div>
  );
};

export default TodoList;
