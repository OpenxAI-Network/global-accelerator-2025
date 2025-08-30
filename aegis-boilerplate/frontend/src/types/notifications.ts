export enum NotificationType {
  LIQUIDATION = 'liquidation',
  WARNING = 'warning',
  INFO = 'info',
  SUCCESS = 'success',
  ERROR = 'error',
  PRICE_ALERT = 'price_alert',
  HEALTH_UPDATE = 'health_update',
  TRANSACTION = 'transaction',
  SECURITY = 'security'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Notification {
  id?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp?: Date;
  isRead?: boolean;
  chainId?: number;
  chainName?: string;
  positionId?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  telegram: boolean;
  discord: boolean;
  email: boolean;
  push: boolean;
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
  filters: {
    types: NotificationType[];
    priorities: NotificationPriority[];
    chains: number[];
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  priority: NotificationPriority;
  titleTemplate: string;
  messageTemplate: string;
  variables: string[];
  enabled: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'web' | 'telegram' | 'discord' | 'email' | 'push';
  enabled: boolean;
  config: Record<string, any>;
  lastUsed?: Date;
  errorCount: number;
}
