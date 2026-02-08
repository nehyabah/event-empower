import { useState, useEffect, useCallback } from 'react';
import { userService, Guest, CreateGuestInput, UpdateGuestInput, GuestStats } from '@/services/api/userService';
import { toast } from 'sonner';

export function useGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats>({ total: 0, pending: 0, confirmed: 0, declined: 0, maybe: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuests = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [guestsData, statsData] = await Promise.all([
        userService.getGuests(),
        userService.getGuestStats(),
      ]);
      setGuests(guestsData);
      setStats(statsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch guests';
      setError(message);
      console.error('Error fetching guests:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const createGuest = useCallback(async (input: CreateGuestInput): Promise<Guest | null> => {
    try {
      const newGuest = await userService.createGuest(input);
      setGuests(prev => [...prev, newGuest].sort((a, b) => a.name.localeCompare(b.name)));
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        [newGuest.status]: prev[newGuest.status] + 1,
      }));
      toast.success('Guest added successfully');
      return newGuest;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add guest';
      toast.error(message);
      console.error('Error creating guest:', err);
      return null;
    }
  }, []);

  const updateGuest = useCallback(async (id: string, input: UpdateGuestInput): Promise<Guest | null> => {
    try {
      const oldGuest = guests.find(g => g.id === id);
      const updatedGuest = await userService.updateGuest(id, input);
      setGuests(prev => prev.map(g => g.id === id ? updatedGuest : g).sort((a, b) => a.name.localeCompare(b.name)));

      // Update stats if status changed
      if (oldGuest && input.status && oldGuest.status !== input.status) {
        setStats(prev => ({
          ...prev,
          [oldGuest.status]: prev[oldGuest.status] - 1,
          [input.status!]: prev[input.status!] + 1,
        }));
      }

      toast.success('Guest updated successfully');
      return updatedGuest;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update guest';
      toast.error(message);
      console.error('Error updating guest:', err);
      return null;
    }
  }, [guests]);

  const deleteGuest = useCallback(async (id: string): Promise<boolean> => {
    try {
      const guestToDelete = guests.find(g => g.id === id);
      await userService.deleteGuest(id);
      setGuests(prev => prev.filter(g => g.id !== id));

      if (guestToDelete) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          [guestToDelete.status]: prev[guestToDelete.status] - 1,
        }));
      }

      toast.success('Guest removed successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove guest';
      toast.error(message);
      console.error('Error deleting guest:', err);
      return false;
    }
  }, [guests]);

  // Quick status update helper
  const updateGuestStatus = useCallback(async (id: string, status: Guest['status']): Promise<boolean> => {
    const result = await updateGuest(id, { status });
    return result !== null;
  }, [updateGuest]);

  // Filter helpers
  const guestsByStatus = useCallback((status: Guest['status']) => {
    return guests.filter(g => g.status === status);
  }, [guests]);

  const guestsByGroup = useCallback((group: string) => {
    return guests.filter(g => g.guest_group === group);
  }, [guests]);

  // Get unique groups
  const groups = [...new Set(guests.map(g => g.guest_group).filter(Boolean))] as string[];

  return {
    guests,
    stats,
    isLoading,
    error,
    fetchGuests,
    createGuest,
    updateGuest,
    deleteGuest,
    updateGuestStatus,
    guestsByStatus,
    guestsByGroup,
    groups,
    confirmedGuests: guests.filter(g => g.status === 'confirmed'),
    pendingGuests: guests.filter(g => g.status === 'pending'),
    declinedGuests: guests.filter(g => g.status === 'declined'),
    maybeGuests: guests.filter(g => g.status === 'maybe'),
  };
}

export default useGuests;
