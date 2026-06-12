import { apiClient } from "./client";

export const invitationService = {
  async previewInvite(code: string): Promise<{ plannerName: string; coupleName: string }> {
    const response = await apiClient.get<{ plannerName: string; coupleName: string }>(
      `/invitations/preview/${encodeURIComponent(code.trim().toUpperCase())}`
    );
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to load invite");
    return response.data;
  },

  async acceptInvite(code: string) {
    const response = await apiClient.post<{ id: string }>("/invitations/accept", { code });
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to accept invite");
    return response.data;
  },
};

export default invitationService;
