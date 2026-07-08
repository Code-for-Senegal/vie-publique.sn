export type NotificationPermissionStatus = 'default' | 'granted' | 'denied';

export interface NotificationState {
  permission: NotificationPermissionStatus;
  isSubscribed: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface SubscribeRequest {
  token: string;
  topic: string;
}

export interface SubscribeResponse {
  success: boolean;
  error?: string;
}

export interface UnsubscribeRequest {
  token: string;
  topic: string;
}

export interface UnsubscribeResponse {
  success: boolean;
  error?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  data?: {
    url?: string;
    tag?: string;
    [key: string]: unknown;
  };
}
