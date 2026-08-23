import { useState, useEffect, useCallback } from 'react';
import { plannerService, PlannerClient, CreateClientInput, UpdateClientInput } from '@/services/api/plannerService';
import { toast } from 'sonner';

export function usePlannerClients() {
  const [clients, setClients] = useState<PlannerClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await plannerService.getClients();
      setClients(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch clients';
      setError(message);
      console.error('Error fetching clients:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = useCallback(async (input: CreateClientInput): Promise<PlannerClient | null> => {
    try {
      const newClient = await plannerService.createClient(input);
      setClients(prev => [...prev, newClient]);
      toast.success('Client created successfully');
      return newClient;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create client';
      toast.error(message);
      console.error('Error creating client:', err);
      return null;
    }
  }, []);

  const updateClient = useCallback(async (id: string, input: UpdateClientInput): Promise<PlannerClient | null> => {
    try {
      const updatedClient = await plannerService.updateClient(id, input);
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      toast.success('Client updated successfully');
      return updatedClient;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update client';
      toast.error(message);
      console.error('Error updating client:', err);
      return null;
    }
  }, []);

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    try {
      await plannerService.deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
      toast.success('Client deleted');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete client';
      toast.error(message);
      return false;
    }
  }, []);

  const archiveClient = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updated = await plannerService.archiveClient(id);
      setClients(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('Client archived');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive client';
      toast.error(message);
      return false;
    }
  }, []);

  const unarchiveClient = useCallback(async (id: string): Promise<boolean> => {
    try {
      const updated = await plannerService.unarchiveClient(id);
      setClients(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('Client restored');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to restore client';
      toast.error(message);
      return false;
    }
  }, []);

  const createInvite = useCallback(async (id: string): Promise<{ inviteCode: string } | null> => {
    try {
      const result = await plannerService.createClientInvite(id);
      setClients(prev => prev.map(c => c.id === id ? {
        ...c,
        invite_code: result.inviteCode,
        invite_status: result.inviteStatus as PlannerClient['invite_status'],
        invite_sent_at: result.inviteSentAt,
      } : c));
      toast.success('Invite code generated');
      return { inviteCode: result.inviteCode };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate invite code';
      toast.error(message);
      console.error('Error generating invite code:', err);
      return null;
    }
  }, []);

  // Helper to get formatted client name
  const getClientName = useCallback((client: PlannerClient): string => {
    return `${client.partner1_name} & ${client.partner2_name}`;
  }, []);

  const clientsByStatus = useCallback((status: 'active' | 'completed' | 'archived') => {
    return clients.filter(c => c.status === status);
  }, [clients]);

  return {
    clients,
    isLoading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    archiveClient,
    unarchiveClient,
    createInvite,
    getClientName,
    clientsByStatus,
    activeClients:   clients.filter(c => c.status === 'active'),
    completedClients: clients.filter(c => c.status === 'completed'),
    archivedClients: clients.filter(c => c.status === 'archived'),
  };
}

export default usePlannerClients;
