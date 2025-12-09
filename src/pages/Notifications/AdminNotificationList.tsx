import React from 'react';
import { useTranslation } from 'react-i18next';
import type { NotificationWithStats } from '../../types';
import { Badge, Button } from '../../components/common';

interface AdminNotificationListProps {
  notifications: NotificationWithStats[];
  onViewRecipients: (id: number) => void;
  onDelete: (id: number) => void;
}

const AdminNotificationList: React.FC<AdminNotificationListProps> = ({
  notifications,
  onViewRecipients,
  onDelete
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
        <p className="mt-4 text-gray-500">{t('notifications.admin.noNotifications')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('notifications.admin.notification')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('notifications.admin.type')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('notifications.admin.priority')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('notifications.admin.recipients')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('notifications.admin.readStatus')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('notifications.admin.created')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('notifications.admin.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {notifications.map((notification) => (
            <tr key={notification.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{notification.title}</div>
                <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getTypeBadge(notification.type)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getPriorityBadge(notification.priority)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {notification.totalRecipients}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-sm">{notification.readCount} {t('notifications.admin.read')}</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-red-600 text-sm">{notification.unreadCount} {t('notifications.admin.unread')}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{
                      width: notification.totalRecipients > 0
                        ? `${(notification.readCount / notification.totalRecipients) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewRecipients(notification.id)}
                  >
                    {t('notifications.admin.viewDetails')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(notification.id)}
                  >
                    {t('notifications.admin.delete')}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminNotificationList;
