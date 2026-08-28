import { apiClient } from "./client";

export interface WorkspaceMessage {
  id: string;
  event_id: string;
  sender_id: string | null;
  sender_name: string | null;
  sender_user_type: string | null;
  message: string;
  created_at: string;
}

export interface WorkspaceChatParticipant {
  user_id: string;
  name: string | null;
  email: string | null;
  user_type: string;
}

export interface WorkspaceChatData {
  messages: WorkspaceMessage[];
  participants: WorkspaceChatParticipant[];
}

export const workspaceMessageService = {
  async getMessages(eventId: string): Promise<WorkspaceChatData> {
    const response = await apiClient.get<WorkspaceChatData>(`/workspace-chat/${eventId}/messages`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || { messages: [], participants: [] };
  },

  async sendMessage(eventId: string, message: string): Promise<WorkspaceMessage> {
    const response = await apiClient.post<WorkspaceMessage>(`/workspace-chat/${eventId}/messages`, { message });
    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to send message");
    }
    return response.data;
  },
};
