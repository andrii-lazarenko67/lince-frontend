export type NotificationType = 'alert' | 'incident' | 'inspection' | 'stock' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  readAt: string | null;
  referenceType: string | null;
  referenceId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  error: string | null;
}
