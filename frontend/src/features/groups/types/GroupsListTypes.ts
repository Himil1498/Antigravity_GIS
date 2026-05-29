import type { ApiGroup } from '../../../services/group/index';

export interface GroupsListProps {
  groups: ApiGroup[];
  selectedGroups?: number[];
  onSelectGroup?: (groupId: number) => void;
  onSelectAll?: () => void;
  onEdit?: (group: ApiGroup) => void;
  onDelete?: (groupId: number) => void;
  onView?: (group: ApiGroup) => void;
}

