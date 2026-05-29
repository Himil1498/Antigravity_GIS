/**
 * User Service
 * User management CRUD operations
 */

import { apiClient } from "./client";
import type { ApiResponse, User } from "./types";

export const userService = {
  async getUsers(filters?: any): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>("/users", {
      params: filters,
    });
    return response.data.data;
  },

  async getUserById(id: string): Promise<User> {
    if (process.env.NODE_ENV === "development") {
      throw new Error("User not found");
    }

    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data;
  },

  async createUser(user: Omit<User, "id" | "loginHistory">): Promise<User> {
    if (process.env.NODE_ENV === "development") {
      const newUser: User = {
        ...user,
        id: `USER${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
        loginHistory: [],
      };
      return newUser;
    }

    const response = await apiClient.post<ApiResponse<User>>("/users", user);
    return response.data.data;
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    if (process.env.NODE_ENV === "development") {
      return { id, ...updates } as User;
    }

    const response = await apiClient.put<ApiResponse<User>>(
      `/users/${id}`,
      updates
    );
    return response.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      return Promise.resolve();
    }

    await apiClient.delete(`/users/${id}`);
  },

  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<User>
  ): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      return Promise.resolve();
    }

    await apiClient.post("/users/bulk-update", { userIds, updates });
  },

  async bulkDeleteUsers(userIds: string[]): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      return Promise.resolve();
    }

    await apiClient.post("/users/bulk-delete", { userIds });
  },

  async resetPassword(
    userId: string,
    newPassword?: string
  ): Promise<{ temporaryPassword?: string }> {
    // Extract numeric ID from OCGID format (OCGID001 -> 1)
    const numericId = userId.startsWith("OCGID")
      ? userId.replace("OCGID", "").replace(/^0+/, "") || "0"
      : userId;

    const response = await apiClient.post<
      ApiResponse<{ temporaryPassword?: string }>
    >(`/users/${numericId}/reset-password`, { newPassword });

    return response.data.data;
  },

  async getUsersList(): Promise<{
    success: boolean;
    users: Array<{
      id: number;
      username: string;
      full_name: string;
      email: string;
      role: string;
    }>;
  }> {
    const response = await apiClient.get<{
      success: boolean;
      users: Array<{
        id: number;
        username: string;
        full_name: string;
        email: string;
        role: string;
      }>;
    }>("/search/users-list");

    return response.data;
  },
  async getUserActivity(userId: string): Promise<any[]> {
    const numericId = userId.replace("OCGID", "").replace(/^0+/, "") || userId;

    try {
      const response = await apiClient.get<{ success: boolean; logs: any[] }>(
        `/audit/user/${numericId}?days=30&limit=50`
      );
      return response.data.logs || [];
    } catch (error) {
      console.warn("Failed to fetch user activity", error);
      return [];
    }
  },
};

