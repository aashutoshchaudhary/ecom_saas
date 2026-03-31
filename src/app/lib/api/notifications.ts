import { api } from "./client";

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list(params?: { page?: number; limit?: number; read?: boolean }) {
    return api.get<{ data: Notification[]; meta: any }>("/notifications", params);
  },

  markRead(id: string) {
    return api.put<void>(`/notifications/${id}/read`);
  },

  markAllRead() {
    return api.put<void>("/notifications/read-all");
  },

  getUnreadCount() {
    return api.get<{ count: number }>("/notifications/unread-count");
  },
};
