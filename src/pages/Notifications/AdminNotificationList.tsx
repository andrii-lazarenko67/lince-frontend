import React from 'react';
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
  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'incident':
        return <Badge variant="danger">Incident</Badge>;
      case 'alert':
        return <Badge variant="warning">Alert</Badge>;
      case 'stock':
        return <Badge variant="warning">Stock</Badge>;
      case 'inspection':
        return <Badge variant="info">Inspection</Badge>;
      case 'system':
        return <Badge variant="secondary">System</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="danger">Critical</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
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
        <p className="mt-4 text-gray-500">No notifications in the system</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notification
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recipients
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Read Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
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
                  <span className="text-green-600 text-sm">{notification.readCount} read</span>
                  <span className="text-gray-400">/</span>
                  <span className="text-red-600 text-sm">{notification.unreadCount} unread</span>
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
                    View Details
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(notification.id)}
                  >
                    Delete
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
