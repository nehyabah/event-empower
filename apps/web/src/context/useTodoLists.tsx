import { useState, useEffect, useCallback } from "react";
import { TodoItem, TodoListItem } from "./types";
import { toast } from "sonner";
import { userService, TodoList as ApiTodoList, TodoItem as ApiTodoItem } from "@/services/api/userService";
import { useAuth } from "@/context/AuthContext";

export interface TodoListsHook {
  todoLists: TodoListItem[];
  isLoading: boolean;
  error: string | null;
  hasPlanner: boolean;
  createTodoList: (title: string, description?: string, isShared?: boolean) => Promise<void>;
  updateTodoList: (id: string, updates: Partial<TodoListItem>) => Promise<void>;
  deleteTodoList: (id: string) => Promise<void>;
  addTodoItem: (listId: string, text: string, status?: TodoItem["status"]) => Promise<void>;
  toggleTodoItem: (listId: string, itemId: string) => Promise<void>;
  updateTodoItem: (listId: string, itemId: string, updates: Partial<TodoItem>) => Promise<void>;
  deleteTodoItem: (listId: string, itemId: string) => Promise<void>;
  reorderTodoItems: (listId: string, orderedIds: string[]) => Promise<void>;
  setAllCompleted: (listId: string, completed: boolean) => Promise<void>;
  clearCompleted: (listId: string) => Promise<void>;
  getTodoList: (id: string) => TodoListItem | undefined;
}

// Convert API types to local types
const toLocalTodoItem = (apiItem: ApiTodoItem): TodoItem => ({
  id: apiItem.id,
  text: apiItem.text,
  completed: apiItem.completed,
  status: apiItem.status ?? (apiItem.completed ? "done" : "todo"),
  sortOrder: apiItem.sort_order,
  dueDate: apiItem.due_date ?? null,
});

const toLocalTodoList = (apiList: ApiTodoList): TodoListItem => ({
  id: apiList.id,
  title: apiList.title,
  description: apiList.description || undefined,
  createdAt: new Date(apiList.created_at),
  isCompleted: apiList.is_completed,
  isShared: apiList.is_shared,
  items: (apiList.items || []).map(toLocalTodoItem).sort((a, b) => a.sortOrder - b.sortOrder),
});

export const useTodoLists = (): TodoListsHook => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [todoLists, setTodoLists] = useState<TodoListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPlanner, setHasPlanner] = useState(false);

  // Fetch todo lists and planner link on mount
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setTodoLists([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [data, plannerLink] = await Promise.all([
          userService.getTodoLists(),
          userService.getPlannerLink().catch(() => null),
        ]);
        setTodoLists(data.map(toLocalTodoList));
        setHasPlanner(plannerLink !== null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch todo lists';
        setError(message);
        console.error('Error fetching todo lists:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated]);

  const createTodoList = useCallback(async (title: string, description?: string, isShared?: boolean) => {
    try {
      const newList = await userService.createTodoList({ title, description, isShared });
      setTodoLists(prev => [...prev, toLocalTodoList(newList)]);
      toast.success("New list created", {
        description: `${title} has been added to your lists`
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create list';
      toast.error(message);
      throw err;
    }
  }, []);

  const updateTodoList = useCallback(async (id: string, updates: Partial<TodoListItem>) => {
    try {
      const apiUpdates: { title?: string; description?: string | null; isCompleted?: boolean; isShared?: boolean } = {};
      if (updates.title !== undefined) apiUpdates.title = updates.title;
      if (updates.description !== undefined) apiUpdates.description = updates.description || null;
      if (updates.isCompleted !== undefined) apiUpdates.isCompleted = updates.isCompleted;
      if (updates.isShared !== undefined) apiUpdates.isShared = updates.isShared;

      const updatedList = await userService.updateTodoList(id, apiUpdates);
      setTodoLists(prev =>
        prev.map(list => list.id === id ? toLocalTodoList(updatedList) : list)
      );

      toast.success("List updated", {
        description: `Your changes have been saved`
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update list';
      toast.error(message);
      throw err;
    }
  }, []);

  const deleteTodoList = useCallback(async (id: string) => {
    try {
      const listToDelete = todoLists.find(list => list.id === id);
      await userService.deleteTodoList(id);
      setTodoLists(prev => prev.filter(list => list.id !== id));

      toast.success("List deleted", {
        description: listToDelete ? `"${listToDelete.title}" has been removed` : 'List removed'
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete list';
      toast.error(message);
      throw err;
    }
  }, [todoLists]);

  const addTodoItem = useCallback(async (listId: string, text: string, status?: TodoItem["status"]) => {
    try {
      const newItem = await userService.addTodoItem(listId, { text, status });
      setTodoLists(prev =>
        prev.map(list =>
          list.id === listId
            ? {
                ...list,
                items: [...list.items, toLocalTodoItem(newItem)].sort(
                  (a, b) => a.sortOrder - b.sortOrder
                ),
              }
            : list
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      toast.error(message);
      throw err;
    }
  }, []);

  const toggleTodoItem = useCallback(async (listId: string, itemId: string) => {
    try {
      const updatedItem = await userService.toggleTodoItem(listId, itemId);
      setTodoLists(prev =>
        prev.map(list =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map(item =>
                  item.id === itemId ? toLocalTodoItem(updatedItem) : item
                )
              }
            : list
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle item';
      toast.error(message);
      throw err;
    }
  }, []);

  const updateTodoItem = useCallback(async (listId: string, itemId: string, updates: Partial<TodoItem>) => {
    try {
      const input: { text?: string; completed?: boolean; status?: TodoItem["status"]; sortOrder?: number; dueDate?: string | null } = {};
      if (updates.text !== undefined) input.text = updates.text;
      if (updates.completed !== undefined) input.completed = updates.completed;
      if (updates.status !== undefined) input.status = updates.status;
      if (updates.sortOrder !== undefined) input.sortOrder = updates.sortOrder;
      if (updates.dueDate !== undefined) input.dueDate = updates.dueDate;

      const updatedItem = await userService.updateTodoItem(listId, itemId, input);
      setTodoLists(prev =>
        prev.map(list =>
          list.id === listId
            ? {
                ...list,
                items: list.items
                  .map(item => (item.id === itemId ? toLocalTodoItem(updatedItem) : item))
                  .sort((a, b) => a.sortOrder - b.sortOrder),
              }
            : list
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      toast.error(message);
      throw err;
    }
  }, []);

  const deleteTodoItem = useCallback(async (listId: string, itemId: string) => {
    try {
      await userService.deleteTodoItem(listId, itemId);
      setTodoLists(prev =>
        prev.map(list =>
          list.id === listId
            ? { ...list, items: list.items.filter(item => item.id !== itemId) }
            : list
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(message);
      throw err;
    }
  }, []);

  const reorderTodoItems = useCallback(async (listId: string, orderedIds: string[]) => {
    const nextOrder = new Map(orderedIds.map((id, index) => [id, index]));
    setTodoLists(prev =>
      prev.map(list =>
        list.id === listId
          ? {
              ...list,
              items: list.items
                .map(item =>
                  nextOrder.has(item.id)
                    ? { ...item, sortOrder: nextOrder.get(item.id)! }
                    : item
                )
                .sort((a, b) => a.sortOrder - b.sortOrder),
            }
          : list
      )
    );

    try {
      await Promise.all(
        orderedIds.map((id, index) =>
          userService.updateTodoItem(listId, id, { sortOrder: index })
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reorder items';
      toast.error(message);
      throw err;
    }
  }, []);

  const setAllCompleted = useCallback(async (listId: string, completed: boolean) => {
    const list = todoLists.find(item => item.id === listId);
    if (!list) return;

    const updates = list.items.map(item =>
      userService.updateTodoItem(listId, item.id, {
        completed,
        status: completed ? "done" : "todo",
      })
    );

    try {
      const updatedItems = await Promise.all(updates);
      setTodoLists(prev =>
        prev.map(item =>
          item.id === listId
            ? {
                ...item,
                items: updatedItems.map(toLocalTodoItem).sort((a, b) => a.sortOrder - b.sortOrder),
              }
            : item
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update items';
      toast.error(message);
      throw err;
    }
  }, [todoLists]);

  const clearCompleted = useCallback(async (listId: string) => {
    const list = todoLists.find(item => item.id === listId);
    if (!list) return;
    const completedItems = list.items.filter(item => item.completed);
    if (completedItems.length === 0) return;

    try {
      await Promise.all(
        completedItems.map(item => userService.deleteTodoItem(listId, item.id))
      );
      setTodoLists(prev =>
        prev.map(item =>
          item.id === listId
            ? { ...item, items: item.items.filter(todo => !todo.completed) }
            : item
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear completed items';
      toast.error(message);
      throw err;
    }
  }, [todoLists]);

  const getTodoList = useCallback((id: string) => {
    return todoLists.find(list => list.id === id);
  }, [todoLists]);

  return {
    todoLists,
    isLoading,
    error,
    hasPlanner,
    createTodoList,
    updateTodoList,
    deleteTodoList,
    addTodoItem,
    toggleTodoItem,
    updateTodoItem,
    deleteTodoItem,
    reorderTodoItems,
    setAllCompleted,
    clearCompleted,
    getTodoList
  };
};
