export interface LoginFormData {
  username: string;
  password: "";
}

export interface TwoFactorState {
  showPrompt: boolean;
  userId: number | null;
  email: string;
  expiresIn: number;
}

export interface ForgotPasswordState {
  showModal: boolean;
  username: string;
  reason: string;
  requestSent: boolean;
  isSending: boolean;
  error: string;
}

export interface ContactSupportState {
  showModal: boolean;
  emailCopied: boolean;
}

