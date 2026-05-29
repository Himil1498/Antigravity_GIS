import { User } from "../../../../types/auth/index";

export type ModalType = "create" | "edit" | "view";

export interface UserFormModalProps {
  isOpen: boolean;
  modalType: ModalType;
  formData: Partial<User>;
  formErrors: Record<string, string>;
  isLoading: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onFieldChange: (name: string, value: any) => void;
}

export interface FormSectionProps {
  formData: Partial<User>;
  formErrors: Record<string, string>;
  isViewMode: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onFieldChange: (name: string, value: any) => void;
}

export interface PersonalInfoSectionProps extends FormSectionProps {
  showPassword: boolean;
  onTogglePassword: () => void;
  modalType: ModalType;
}

export interface ModalHeaderProps {
  modalType: ModalType;
  onClose: () => void;
}

export interface FormActionsProps {
  isViewMode: boolean;
  isLoading: boolean;
  modalType: ModalType;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}


