
export interface RegionUsageStats {
  region: string;
  totalAccesses: number;
  successfulAccesses: number;
  deniedAccesses: number;
  uniqueUsers: number;
  toolsUsed: Record<string, number>;
  lastAccessed?: Date;
  mostActiveUser?: {
    userId: string;
    userName: string;
    accessCount: number;
  };
}

export interface RegionActivityTimeline {
  date: string;
  region: string;
  accessCount: number;
  denialCount: number;
}

export interface UserRegionActivity {
  userId: string;
  userName: string;
  userEmail: string;
  regionsAccessed: string[];
  totalAccesses: number;
  deniedAttempts: number;
  mostAccessedRegion: string;
  lastActive?: Date;
}

export interface RegionHeatmapData {
  region: string;
  intensity: number; // 0-100 scale
  accessCount: number;
  uniqueUsers: number;
}

