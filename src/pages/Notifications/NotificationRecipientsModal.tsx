import React from 'react';
import type { NotificationDetail } from '../../types';
import { Badge, Button } from '../../components/common';

interface NotificationRecipientsModalProps {
  notification: NotificationDetail | null;
  onClose: () => void;
}

const NotificationRecipientsModal: React.FC<NotificationRecipientsModalProps> = ({
  notification,
  onClose
}) => {
  if (!notification) return null;

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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="danger">Admin</Badge>;
      case 'manager':
        return <Badge variant="primary">Manager</Badge>;
      case 'technician':
        return <Badge variant="secondary">Technician</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{notification.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                {getTypeBadge(notification.type)}
                {getPriorityBadge(notification.priority)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="mt-3 text-gray-600">{notification.message}</p>
          <p className="mt-2 text-sm text-gray-500">
            Created: {new Date(notification.createdAt).toLocaleString()}
            {notification.createdBy && ` by ${notification.createdBy.name}`}
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Users who read */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Read ({notification.readCount})
              </h3>
              {notification.readBy.length === 0 ? (
                <p className="text-gray-500 text-sm">No one has read this notification yet</p>
              ) : (
                <ul className="space-y-2">
                  {notification.readBy.map((user) => (
                    <li key={user.userId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      {getRoleBadge(user.role)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Users who haven't read */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Unread ({notification.unreadCount})
              </h3>
              {notification.unreadBy.length === 0 ? (
                <p className="text-gray-500 text-sm">Everyone has read this notification</p>
              ) : (
                <ul className="space-y-2">
                  {notification.unreadBy.map((user) => (
                    <li key={user.userId} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      {getRoleBadge(user.role)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Total: {notification.totalRecipients} recipients |{' '}
              <span className="text-green-600">{notification.readCount} read</span> |{' '}
              <span className="text-red-600">{notification.unreadCount} unread</span>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationRecipientsModal;
