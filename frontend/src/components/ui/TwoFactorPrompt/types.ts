export interface TwoFactorPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  onResendCode: () => Promise<void>;
  email: string;
  expiresIn?: number;
}

