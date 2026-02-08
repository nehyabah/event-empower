import { apiClient } from "@/services/api/client";

export const submitContactSupport = async (payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ message: string; ticketId: string; ticketNumber: number; ticketCode: string }> => {
  const response = await apiClient.post<{
    message: string;
    ticketId: string;
    ticketNumber: number;
    ticketCode: string;
  }>("/public/contact", payload);
  if (response.error) {
    throw new Error(response.error || "Failed to submit support request");
  }
  if (!response.data) {
    throw new Error("Failed to submit support request");
  }
  return response.data;
};

export const subscribeToNewsletter = async (payload: {
  email: string;
  name?: string;
  source?: string;
}): Promise<void> => {
  const response = await apiClient.post("/public/newsletter/subscribe", payload);
  if (response.error) {
    throw new Error(response.error || "Failed to subscribe");
  }
};
