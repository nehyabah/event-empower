
import { useState } from "react";
import { TodoItem, TodoListItem } from "./types";
import { toast } from "sonner";

// Initial data
const initialTodoLists: TodoListItem[] = [
  {
    id: "list-1",
    title: "Wedding Venue Checklist",
    description: "Items to verify with the venue before booking",
    createdAt: new Date(),
    isCompleted: false,
    items: [
      { id: "item-1", text: "Check venue capacity", completed: true },
      { id: "item-2", text: "Confirm available dates", completed: true },
      { id: "item-3", text: "Review contract details", completed: false },
      { id: "item-4", text: "Discuss catering options", completed: false },
    ]
  },
  {
    id: "list-2",
    title: "Wedding Day Emergency Kit",
    description: "Essential items to have on the wedding day",
    createdAt: new Date(),
    isCompleted: false,
    items: [
      { id: "item-5", text: "Safety pins", completed: true },
      { id: "item-6", text: "Fashion tape", completed: false },
      { id: "item-7", text: "Stain remover", completed: false },
      { id: "item-8", text: "Pain relievers", completed: true },
    ]
  }
];

export interface TodoListsHook {
  todoLists: TodoListItem[];
  createTodoList: (title: string, description?: string) => void;
  updateTodoList: (id: string, updates: Partial<TodoListItem>) => void;
  deleteTodoList: (id: string) => void;
  addTodoItem: (listId: string, text: string) => void;
  toggleTodoItem: (listId: string, itemId: string) => void;
  deleteTodoItem: (listId: string, itemId: string) => void;
  getTodoList: (id: string) => TodoListItem | undefined;
}

export const useTodoLists = (): TodoListsHook => {
  const [todoLists, setTodoLists] = useState<TodoListItem[]>(initialTodoLists);

  const createTodoList = (title: string, description?: string) => {
    const newList: TodoListItem = {
      id: `list-${Date.now()}`,
      title,
      description,
      createdAt: new Date(),
      items: [],
      isCompleted: false
    };
    
    setTodoLists([...todoLists, newList]);
    toast.success("New list created", {
      description: `${title} has been added to your lists`
    });
  };

  const updateTodoList = (id: string, updates: Partial<TodoListItem>) => {
    setTodoLists(
      todoLists.map(list => 
        list.id === id ? { ...list, ...updates } : list
      )
    );
    
    toast.success("List updated", {
      description: `Your changes have been saved`
    });
  };

  const deleteTodoList = (id: string) => {
    const listToDelete = todoLists.find(list => list.id === id);
    if (!listToDelete) return;
    
    setTodoLists(todoLists.filter(list => list.id !== id));
    
    toast.success("List deleted", {
      description: `"${listToDelete.title}" has been removed`
    });
  };

  const addTodoItem = (listId: string, text: string) => {
    const newItem: TodoItem = {
      id: `item-${Date.now()}`,
      text,
      completed: false
    };
    
    setTodoLists(
      todoLists.map(list => 
        list.id === listId 
          ? { ...list, items: [...list.items, newItem] } 
          : list
      )
    );
  };

  const toggleTodoItem = (listId: string, itemId: string) => {
    setTodoLists(
      todoLists.map(list => 
        list.id === listId 
          ? { 
              ...list, 
              items: list.items.map(item => 
                item.id === itemId 
                  ? { ...item, completed: !item.completed } 
                  : item
              ) 
            } 
          : list
      )
    );
  };

  const deleteTodoItem = (listId: string, itemId: string) => {
    setTodoLists(
      todoLists.map(list => 
        list.id === listId 
          ? { ...list, items: list.items.filter(item => item.id !== itemId) } 
          : list
      )
    );
  };

  const getTodoList = (id: string) => {
    return todoLists.find(list => list.id === id);
  };

  return {
    todoLists,
    createTodoList,
    updateTodoList,
    deleteTodoList,
    addTodoItem,
    toggleTodoItem,
    deleteTodoItem,
    getTodoList
  };
};
