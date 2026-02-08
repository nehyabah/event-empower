import { useState, useEffect, useCallback } from 'react';
import { plannerService, PlannerTask, CreateTaskInput, UpdateTaskInput } from '@/services/api/plannerService';
import { toast } from 'sonner';

export function usePlannerTasks(clientId?: string) {
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await plannerService.getTasks(clientId);
      setTasks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(message);
      console.error('Error fetching tasks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (input: CreateTaskInput): Promise<PlannerTask | null> => {
    try {
      const newTask = await plannerService.createTask(input);
      setTasks(prev => [newTask, ...prev]);
      toast.success('Task created successfully');
      return newTask;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create task';
      toast.error(message);
      console.error('Error creating task:', err);
      return null;
    }
  }, []);

  const updateTask = useCallback(async (id: string, input: UpdateTaskInput): Promise<PlannerTask | null> => {
    try {
      const updatedTask = await plannerService.updateTask(id, input);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      toast.success('Task updated successfully');
      return updatedTask;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task';
      toast.error(message);
      console.error('Error updating task:', err);
      return null;
    }
  }, []);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      await plannerService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Task deleted successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete task';
      toast.error(message);
      console.error('Error deleting task:', err);
      return false;
    }
  }, []);

  // Quick status update helper
  const updateTaskStatus = useCallback(async (id: string, status: 'pending' | 'in-progress' | 'completed'): Promise<boolean> => {
    const result = await updateTask(id, { status });
    return result !== null;
  }, [updateTask]);

  // Filter helpers
  const tasksByStatus = useCallback((status: 'pending' | 'in-progress' | 'completed') => {
    return tasks.filter(t => t.status === status);
  }, [tasks]);

  const tasksByPriority = useCallback((priority: 'low' | 'medium' | 'high') => {
    return tasks.filter(t => t.priority === priority);
  }, [tasks]);

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    tasksByStatus,
    tasksByPriority,
    pendingTasks: tasks.filter(t => t.status === 'pending'),
    inProgressTasks: tasks.filter(t => t.status === 'in-progress'),
    completedTasks: tasks.filter(t => t.status === 'completed'),
    highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status !== 'completed'),
  };
}

export default usePlannerTasks;
