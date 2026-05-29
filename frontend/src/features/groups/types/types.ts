import type { User } from '../../../types/auth/index';
import type { 
  ApiGroup, 
  GroupMember, 
  GroupRegion 
} from '../../../services/group/index';

export interface GroupDetailsDialogProps {
  group: ApiGroup;
  onClose: () => void;
}

export interface GroupDetailsData {
  members: GroupMember[];
  permissions: string[];
  regions: GroupRegion[];
  users: User[];
  isLoading: boolean;
}


