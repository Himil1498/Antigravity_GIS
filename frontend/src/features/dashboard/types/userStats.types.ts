import { User } from "../../../types/auth/index";
import { UserStatistics } from "../../../types/dashboard/index";

export type ViewMode = "grid" | "list";
export type SortBy = "name" | "role" | "recent";

export interface UserStatsPanelProps {
  statistics: UserStatistics | null;
  loading?: boolean;
}

export interface UserListItemProps {
  user: User;
  viewMode: ViewMode;
  onClick: () => void;
}

export interface StatsSummaryCardsProps {
  statistics: UserStatistics;
}

export interface OnlineUsersSectionProps {
  users: User[];
  onUserClick: (user: User) => void;
}

export interface SearchAndControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortBy: SortBy;
  onSortChange: (value: SortBy) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export interface ActivityTrendChartProps {
  dailyData: number[];
}

