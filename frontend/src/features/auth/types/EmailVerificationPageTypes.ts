export interface VerificationResponse {
  success: boolean;
  message?: string;
  error?: string;
  alreadyVerified?: boolean;
}

export type VerificationStatus = 'verifying' | 'success' | 'error' | 'already-verified';

