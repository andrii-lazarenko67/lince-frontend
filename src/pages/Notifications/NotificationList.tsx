import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Notification } from '../../types';
import { Badge } from '../../components/common';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
  onNotificationClick: (notification: Notification) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onNotificationClick
}) => {
  const { t } = useTranslation();

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'incident':
        return <Badge variant="danger">{t('notifications.types.incident')}</Badge>;
      case 'alert':
        return <Badge variant="warning">{t('notifications.types.alert')}</Badge>;
      case 'stock':
        return <Badge variant="warning">{t('notifications.types.stock')}</Badge>;
      case 'inspection':
        return <Badge variant="info">{t('notifications.types.inspection')}</Badge>;
      case 'system':
        return <Badge variant="secondary">{t('notifications.types.system')}</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'alert':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'stock':
        return (
          <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'inspection':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="danger">{t('notifications.priority.critical')}</Badge>;
      case 'high':
        return <Badge variant="warning">{t('notifications.priority.high')}</Badge>;
      case 'medium':
        return <Badge variant="info">{t('notifications.priority.medium')}</Badge>;
      case 'low':
        return <Badge variant="secondary">{t('notifications.priority.low')}</Badge>;
      default:
        return null;
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p className="mt-4 text-gray-500">{t('notifications.list.noNotifications')}</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
        >
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 mt-1">
              {getTypeIcon(notification.type)}
            </div>
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => {
                if (!notification.isRead) onMarkAsRead(notification.id);
                onNotificationClick(notification);
              }}
            >
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                  {t(notification.title)}
                </p>
                {getTypeBadge(notification.type)}
                {getPriorityBadge(notification.priority)}
                {!notification.isRead && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
              <p className="text-sm text-gray-500">{t(notification.message)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex-shrink-0">
              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(notification.id);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {t('notifications.list.markAsRead')}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;
