import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppNavigation } from '../../hooks';
import { Card, Badge } from '../../components/common';

const RecentActivitySection: React.FC = () => {
  const { t } = useTranslation();
  const { recentActivity } = useAppSelector((state) => state.dashboard);
  const { goToDailyLogDetail, goToInspectionDetail, goToIncidentDetail } = useAppNavigation();

  const handleActivityClick = (activity: { type: string; id: number }) => {
    switch (activity.type) {
      case 'dailyLog':
        goToDailyLogDetail(activity.id);
        break;
      case 'inspection':
        goToInspectionDetail(activity.id);
        break;
      case 'incident':
        goToIncidentDetail(activity.id);
        break;
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'dailyLog':
        return <Badge variant="primary">{t('nav.dailyLogs')}</Badge>;
      case 'inspection':
        return <Badge variant="info">{t('nav.inspections')}</Badge>;
      case 'incident':
        return <Badge variant="danger">{t('nav.incidents')}</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <Card title={t('dashboard.recentLogs')}>
      {recentActivity.length === 0 ? (
        <p className="text-gray-500 text-center py-4">{t('common.noData')}</p>
      ) : (
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={`${activity.type}-${activity.id}`}
              onClick={() => handleActivityClick(activity)}
              className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex-shrink-0">
                {getActivityBadge(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-gray-500">
                  {activity.system} - {activity.user}
                </p>
              </div>
              <div className="flex-shrink-0 text-xs text-gray-400">
                {formatDate(activity.date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentActivitySection;
