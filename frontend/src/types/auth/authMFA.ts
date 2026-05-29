
// Multi-factor Authentication
export interface MFASetup {
  type: 'totp' | 'sms' | 'email';
  secret?: string; // For TOTP
  qrCode?: string; // For TOTP
  backupCodes: string[];
}

export interface MFAVerification {
  token: string;
  type: 'totp' | 'sms' | 'email' | 'backup';
}

export interface MFASettings {
  isEnabled: boolean;
  methods: Array<{
    type: 'totp' | 'sms' | 'email';
    isActive: boolean;
    addedAt: string;
  }>;
  backupCodes: {
    remaining: number;
    lastGenerated: string;
  };
}

