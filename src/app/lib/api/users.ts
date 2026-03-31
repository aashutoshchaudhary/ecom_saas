import { api } from "./client";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  phone?: string;
  timezone?: string;
  language?: string;
  mfaEnabled: boolean;
}

export const usersApi = {
  getProfile() {
    return api.get<UserProfile>("/users/me");
  },

  updateProfile(data: Partial<Pick<UserProfile, "firstName" | "lastName" | "phone" | "timezone" | "language">>) {
    return api.put<UserProfile>("/users/me", data);
  },

  updateAvatar(file: File) {
    const formData = new FormData();
    formData.append("avatar", file);
    // Use raw fetch for multipart
    return api.put<UserProfile>("/users/me/avatar", formData);
  },

  changePassword(currentPassword: string, newPassword: string) {
    return api.post<void>("/users/me/password", { currentPassword, newPassword });
  },

  listUsers(params?: { page?: number; limit?: number; search?: string; role?: string }) {
    return api.get<{ data: User[]; meta: any }>("/users", params);
  },

  getUser(id: string) {
    return api.get<User>(`/users/${id}`);
  },

  updateUserRole(userId: string, role: string) {
    return api.put<User>(`/users/${userId}/role`, { role });
  },

  deleteUser(userId: string) {
    return api.delete<void>(`/users/${userId}`);
  },
};
