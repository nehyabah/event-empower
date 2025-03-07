
import { createContext, useContext, ReactNode } from "react";
import { TodoItem, TodoListItem, WishlistItem } from "./types";
import { useTodoLists, TodoListsHook } from "./useTodoLists";
import { useWishlist, WishlistHook } from "./useWishlist";

// Combine the interfaces from both hooks
interface TodoContextType extends TodoListsHook, WishlistHook {}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider = ({ children }: { children: ReactNode }) => {
  const todoListsHook = useTodoLists();
  const wishlistHook = useWishlist();

  // Combine the hooks into a single value
  const contextValue: TodoContextType = {
    ...todoListsHook,
    ...wishlistHook
  };

  return (
    <TodoContext.Provider value={contextValue}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};

// Re-export the types for easier imports elsewhere
export type { TodoItem, TodoListItem, WishlistItem };
