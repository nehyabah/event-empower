import { useState, useEffect, useCallback } from 'react';
import { userService, TodoList, TodoItem, CreateTodoListInput, UpdateTodoListInput, CreateTodoItemInput, UpdateTodoItemInput } from '@/services/api/userService';
import { toast } from 'sonner';

export function useTodoListsApi() {
  const [todoLists, setTodoLists] = useState<TodoList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodoLists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getTodoLists();
      setTodoLists(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch todo lists';
      setError(message);
      console.error('Error fetching todo lists:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodoLists();
  }, [fetchTodoLists]);

  const createTodoList = useCallback(async (title: string, description?: string): Promise<TodoList | null> => {
    try {
      const newList = await userService.createTodoList({ title, description });
      setTodoLists(prev => [...prev, newList]);
      toast.success('New list created', {
        description: `${title} has been added to your lists`
      });
      return newList;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create todo list';
      toast.error(message);
      console.error('Error creating todo list:', err);
      return null;
    }
  }, []);

  const updateTodoList = useCallback(async (id: string, updates: UpdateTodoListInput): Promise<TodoList | null> => {
    try {
      const updatedList = await userService.updateTodoList(id, updates);
      setTodoLists(prev => prev.map(list => list.id === id ? updatedList : list));
      toast.success('List updated', {
        description: 'Your changes have been saved'
      });
      return updatedList;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update todo list';
      toast.error(message);
      console.error('Error updating todo list:', err);
      return null;
    }
  }, []);

  const deleteTodoList = useCallback(async (id: string): Promise<boolean> => {
    try {
      const listToDelete = todoLists.find(list => list.id === id);
      await userService.deleteTodoList(id);
      setTodoLists(prev => prev.filter(list => list.id !== id));
      toast.success('List deleted', {
        description: listToDelete ? `"${listToDelete.title}" has been removed` : 'List removed'
      });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete todo list';
      toast.error(message);
      console.error('Error deleting todo list:', err);
      return false;
    }
  }, [todoLists]);

  const addTodoItem = useCallback(async (listId: string, text: string): Promise<TodoItem | null> => {
    try {
      const newItem = await userService.addTodoItem(listId, { text });
      setTodoLists(prev => prev.map(list =>
        list.id === listId
          ? { ...list, items: [...(list.items || []), newItem] }
          : list
      ));
      return newItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      toast.error(message);
      console.error('Error adding todo item:', err);
      return null;
    }
  }, []);

  const toggleTodoItem = useCallback(async (listId: string, itemId: string): Promise<boolean> => {
    try {
      const updatedItem = await userService.toggleTodoItem(listId, itemId);
      setTodoLists(prev => prev.map(list =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map(item =>
                item.id === itemId ? updatedItem : item
              )
            }
          : list
      ));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to toggle item';
      toast.error(message);
      console.error('Error toggling todo item:', err);
      return false;
    }
  }, []);

  const updateTodoItem = useCallback(async (listId: string, itemId: string, updates: UpdateTodoItemInput): Promise<TodoItem | null> => {
    try {
      const updatedItem = await userService.updateTodoItem(listId, itemId, updates);
      setTodoLists(prev => prev.map(list =>
        list.id === listId
          ? {
              ...list,
              items: list.items.map(item =>
                item.id === itemId ? updatedItem : item
              )
            }
          : list
      ));
      return updatedItem;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      toast.error(message);
      console.error('Error updating todo item:', err);
      return null;
    }
  }, []);

  const deleteTodoItem = useCallback(async (listId: string, itemId: string): Promise<boolean> => {
    try {
      await userService.deleteTodoItem(listId, itemId);
      setTodoLists(prev => prev.map(list =>
        list.id === listId
          ? { ...list, items: list.items.filter(item => item.id !== itemId) }
          : list
      ));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(message);
      console.error('Error deleting todo item:', err);
      return false;
    }
  }, []);

  const getTodoList = useCallback((id: string): TodoList | undefined => {
    return todoLists.find(list => list.id === id);
  }, [todoLists]);

  // Calculate progress stats
  const totalItems = todoLists.reduce((sum, list) => sum + (list.items?.length || 0), 0);
  const completedItems = todoLists.reduce(
    (sum, list) => sum + (list.items?.filter(item => item.completed).length || 0),
    0
  );
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    todoLists,
    isLoading,
    error,
    fetchTodoLists,
    createTodoList,
    updateTodoList,
    deleteTodoList,
    addTodoItem,
    toggleTodoItem,
    updateTodoItem,
    deleteTodoItem,
    getTodoList,
    totalLists: todoLists.length,
    totalItems,
    completedItems,
    progress,
  };
}

export default useTodoListsApi;
