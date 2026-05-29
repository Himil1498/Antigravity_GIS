/**
 * Notification Bell - Type Definitions
 */

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  action_url?: string | null;
  related_entity_id?: number | null;
  related_entity_type?: string | null;
  is_read: boolean;
  created_at: string;
}

export type NotificationType =
  | "password_reset_request"
  | "user_verification"
  | "system_alert"
  | "region_request"
  | "security_alert"
  | "default";

