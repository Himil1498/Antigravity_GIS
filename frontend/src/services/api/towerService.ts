/**
 * Tower Service
 * Tower management CRUD operations
 */

import { apiClient } from "./client";
import type { ApiResponse } from "./types";
import type { TelecomTower } from "../../store/slices/data/index";

// Mock data for development
const MOCK_TOWERS: TelecomTower[] = [
  {
    id: "tower_001",
    name: "Delhi Central Tower",
    type: "cell_tower",
    position: { lat: 28.6139, lng: 77.209 },
    status: "active",
    company: "Jio",
    height: 45,
    frequency: ["1800MHz", "2300MHz"],
    coverage_radius: 2000,
    installation_date: "2020-03-15",
    last_maintenance: "2024-08-15",
    technical_specs: {
      power: "250W",
      antenna_gain: "18dBi",
      technology: "4G/5G",
    },
    metadata: {},
  },
  {
    id: "tower_002",
    name: "Mumbai BKC Tower",
    type: "base_station",
    position: { lat: 19.076, lng: 72.8777 },
    status: "active",
    company: "Airtel",
    height: 60,
    frequency: ["900MHz", "1800MHz", "2100MHz"],
    coverage_radius: 3000,
    installation_date: "2019-11-20",
    last_maintenance: "2024-07-10",
    technical_specs: {
      power: "500W",
      antenna_gain: "20dBi",
      technology: "3G/4G/5G",
    },
    metadata: {},
  },
];

export const towerService = {
  async getTowers(filters?: any): Promise<TelecomTower[]> {
    if (process.env.NODE_ENV === "development") {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_TOWERS;
    }

    const response = await apiClient.get<ApiResponse<TelecomTower[]>>(
      "/towers",
      { params: filters }
    );
    return response.data.data;
  },

  async getTowerById(id: string): Promise<TelecomTower> {
    if (process.env.NODE_ENV === "development") {
      const tower = MOCK_TOWERS.find((t) => t.id === id);
      if (!tower) throw new Error("Tower not found");
      return tower;
    }

    const response = await apiClient.get<ApiResponse<TelecomTower>>(
      `/towers/${id}`
    );
    return response.data.data;
  },

  async createTower(tower: Omit<TelecomTower, "id">): Promise<TelecomTower> {
    if (process.env.NODE_ENV === "development") {
      const newTower: TelecomTower = {
        ...tower,
        id: `tower_${Date.now()}`,
      };
      return newTower;
    }

    const response = await apiClient.post<ApiResponse<TelecomTower>>(
      "/towers",
      tower
    );
    return response.data.data;
  },

  async updateTower(
    id: string,
    updates: Partial<TelecomTower>
  ): Promise<TelecomTower> {
    if (process.env.NODE_ENV === "development") {
      const existingTower = MOCK_TOWERS.find((t) => t.id === id);
      if (!existingTower) throw new Error("Tower not found");
      return { ...existingTower, ...updates };
    }

    const response = await apiClient.put<ApiResponse<TelecomTower>>(
      `/towers/${id}`,
      updates
    );
    return response.data.data;
  },

  async deleteTower(id: string): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      return Promise.resolve();
    }
    await apiClient.delete(`/towers/${id}`);
  },
};

