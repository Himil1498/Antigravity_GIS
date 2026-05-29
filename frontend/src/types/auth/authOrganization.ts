
import type { TelecomCompany, UserRole } from '../common/index';

// OAuth and SSO
export interface OAuthProvider {
  name: string;
  clientId: string;
  scope: string[];
  redirectUri: string;
  authUrl: string;
}

export interface SSOConfiguration {
  enabled: boolean;
  provider: 'google' | 'microsoft' | 'okta' | 'saml';
  configuration: Record<string, any>;
  domainRestrictions: string[];
  autoProvision: boolean;
  defaultRole: UserRole;
}

// Company and Organization
export interface Company {
  id: string;
  name: TelecomCompany | string;
  type: 'telecom_operator' | 'infrastructure_provider' | 'service_provider' | 'government' | 'other';
  license: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  settings: {
    allowedDomains: string[];
    ssoConfiguration?: SSOConfiguration;
    dataRetentionPolicy: number; // days
    maxUsers: number;
    features: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


