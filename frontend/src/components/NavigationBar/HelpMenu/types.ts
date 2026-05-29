// types.ts
export interface HelpMenuItem {
  id: string;
  label: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  iconBgColor: string;
  iconColor: string;
  hoverBgColor: string;
  action: string;
  permission?: string;
}

export interface HelpMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

