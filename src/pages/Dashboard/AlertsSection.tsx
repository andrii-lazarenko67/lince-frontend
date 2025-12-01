import React from 'react';
import { useAppSelector, useAppNavigation } from '../../hooks';
import { Card, Badge } from '../../components/common';

const AlertsSection: React.FC = () => {
  const { alerts } = useAppSelector((state) => state.dashboard);
  const { goToIncidentDetail, goToProductDetail, goToDailyLogDetail } = useAppNavigation();

  const handleAlertClick = (alert: { type: string; referenceId: number }) => {
    switch (alert.type) {
      case 'incident':
        goToIncidentDetail(alert.referenceId);
        break;
      case 'stock':
        goToProductDetail(alert.referenceId);
        break;
      case 'alert':
        goToDailyLogDetail(alert.referenceId);
        break;
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
        return <Badge variant="secondary">{priority}</Badge>;
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
      case 'stock':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'alert':
        return (
          <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Card title="Active Alerts">
      {alerts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No active alerts</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={`${alert.type}-${alert.referenceId}-${index}`}
              onClick={() => handleAlertClick(alert)}
              className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getTypeIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.title}
                  </p>
                  {getPriorityBadge(alert.priority)}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AlertsSection;
