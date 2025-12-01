export type NotificationType = 'alert' | 'incident' | 'inspection' | 'stock' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationCreatedBy {
  id: number;
  name: string;
  email: string;
}

export interface Notification {
  id: number;
  recipientId?: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  referenceType: string | null;
  referenceId: number | null;
  createdBy?: NotificationCreatedBy | null;
  isRead: boolean;
  createdAt: string;
}

// For manager/admin views
export interface NotificationRecipientInfo {
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface NotificationWithStats {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  referenceType: string | null;
  referenceId: number | null;
  createdBy?: NotificationCreatedBy | null;
  createdAt: string;
  totalRecipients: number;
  readCount: number;
  unreadCount: number;
}

export interface NotificationDetail extends NotificationWithStats {
  readBy: NotificationRecipientInfo[];
  unreadBy: NotificationRecipientInfo[];
}

export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  referenceType?: string;
  referenceId?: number;
  recipientIds?: number[];
  sendToAll?: boolean;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  // Admin state
  allNotifications: NotificationWithStats[];
  selectedNotification: NotificationDetail | null;
  error: string | null;
}
