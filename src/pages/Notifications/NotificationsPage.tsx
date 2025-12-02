import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  clearMyNotifications,
  fetchAllNotificationsWithStats,
  fetchNotificationRecipients,
  createNotification,
  deleteNotification,
  clearSelectedNotification
} from '../../store/slices/notificationSlice';
import { Card, Button, ExportDropdown } from '../../components/common';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import {
  NotificationList,
  AdminNotificationList,
  NotificationRecipientsModal,
  CreateNotificationModal
} from './sections';
import type { Notification, CreateNotificationRequest } from '../../types';

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications, unreadCount, allNotifications, selectedNotification } = useAppSelector((state) => state.notifications);
  const { goToIncidentDetail, goToDailyLogDetail, goToProductDetail } = useAppNavigation();

  const [activeTab, setActiveTab] = useState<'my' | 'admin'>('my');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isAdmin = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    dispatch(fetchNotifications({}));
    if (isAdmin) {
      dispatch(fetchAllNotificationsWithStats({}));
    }
  }, [dispatch, isAdmin]);

  const handleMarkAsRead = (id: number) => {
    dispatch(markAsRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleClearMyNotifications = () => {
    if (window.confirm('Are you sure you want to clear all your notifications?')) {
      dispatch(clearMyNotifications());
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.referenceId) return;

    switch (notification.type) {
      case 'incident':
        goToIncidentDetail(notification.referenceId);
        break;
      case 'alert':
        if (notification.referenceType === 'DailyLog') {
          goToDailyLogDetail(notification.referenceId);
        }
        break;
      case 'stock':
        goToProductDetail(notification.referenceId);
        break;
    }
  };

  const handleViewRecipients = (id: number) => {
    dispatch(fetchNotificationRecipients(id));
  };

  const handleCloseRecipientsModal = () => {
    dispatch(clearSelectedNotification());
  };

  const handleCreateNotification = (data: CreateNotificationRequest) => {
    dispatch(createNotification(data));
  };

  const handleDeleteNotification = (id: number) => {
    if (window.confirm('Are you sure you want to delete this notification? This will remove it for all users.')) {
      dispatch(deleteNotification(id));
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'incident': return 'Incident';
      case 'alert': return 'Alert';
      case 'stock': return 'Stock';
      case 'inspection': return 'Inspection';
      case 'system': return 'System';
      default: return type;
    }
  };

  const getExportData = () => {
    const headers = ['Title', 'Message', 'Type', 'Priority', 'Status', 'Created'];
    const rows = notifications.map(notif => [
      notif.title,
      notif.message,
      getTypeLabel(notif.type),
      notif.priority,
      notif.isRead ? 'Read' : 'Unread',
      new Date(notif.createdAt).toLocaleString()
    ]);
    return { headers, rows };
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: 'Notifications Report',
        subtitle: 'LINCE Water Treatment System',
        filename: `notifications-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Notifications', value: String(notifications.length) },
          { label: 'Unread', value: String(unreadCount) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      [{ title: `Notifications (${notifications.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: 'Notifications Report',
        filename: `notifications-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Notifications', value: String(notifications.length) },
          { label: 'Unread', value: String(unreadCount) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      [{ title: `Notifications (${notifications.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: 'Notifications Report',
        filename: `notifications-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Notifications', value: String(notifications.length) },
          { label: 'Unread', value: String(unreadCount) },
          { label: 'Generated', value: new Date().toISOString() }
        ]
      },
      [{ title: 'NOTIFICATIONS', headers, rows }]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'All caught up!'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportHTML={handleExportHTML}
            onExportCSV={handleExportCSV}
            disabled={notifications.length === 0}
          />
          {isAdmin && (
            <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
              Create Notification
            </Button>
          )}
        </div>
      </div>

      {/* Tabs for Admin/Manager */}
      {isAdmin && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('my')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Notifications (Admin)
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {allNotifications.length}
              </span>
            </button>
          </nav>
        </div>
      )}

      {/* My Notifications Tab */}
      {activeTab === 'my' && (
        <Card
          noPadding
          title="My Notifications"
          headerActions={
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  Mark All as Read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleClearMyNotifications}>
                  Clear All
                </Button>
              )}
            </div>
          }
        >
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onNotificationClick={handleNotificationClick}
          />
        </Card>
      )}

      {/* Admin Notifications Tab */}
      {activeTab === 'admin' && isAdmin && (
        <Card noPadding title="All System Notifications">
          <AdminNotificationList
            notifications={allNotifications}
            onViewRecipients={handleViewRecipients}
            onDelete={handleDeleteNotification}
          />
        </Card>
      )}

      {/* Recipients Modal */}
      <NotificationRecipientsModal
        notification={selectedNotification}
        onClose={handleCloseRecipientsModal}
      />

      {/* Create Modal */}
      <CreateNotificationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNotification}
      />
    </div>
  );
};

export default NotificationsPage;
