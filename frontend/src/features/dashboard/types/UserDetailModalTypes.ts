import { User } from '../../../types/auth/index';
import * as adminUserService from '../../../services/adminUserService';

export interface UserDetailModalProps {
  user: User;
  onClose: () => void;
}

export interface DeviceInfo {
  browser: string;
  os: string;
}

