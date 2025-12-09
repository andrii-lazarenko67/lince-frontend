import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common';
import { DonutChart, BarChart } from '../../components/charts';
import type { DashboardStats, RecentActivity, Alert } from '../../types';

interface DashboardChartViewProps {
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  alerts: Alert[];
}

const DashboardChartView: React.FC<DashboardChartViewProps> = ({ stats, recentActivity, alerts }) => {
  const { t } = useTranslation();

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t('common.loading')}</p>
      </div>
    );
  }

  // Systems status donut
  const systemsData = [
    { label: t('systems.active'), value: stats.systems.active, color: '#22c55e' },
    { label: t('systems.inactive'), value: stats.systems.total - stats.systems.active, color: '#6b7280' }
  ];

  // Activity by type
  const activityTypeMap = new Map<string, number>();
  recentActivity.forEach(a => {
    activityTypeMap.set(a.type, (activityTypeMap.get(a.type) || 0) + 1);
  });
  const activityTypeData = [
    { label: t('nav.dailyLogs'), value: activityTypeMap.get('dailyLog') || 0, color: '#3b82f6' },
    { label: t('nav.inspections'), value: activityTypeMap.get('inspection') || 0, color: '#8b5cf6' },
    { label: t('nav.incidents'), value: activityTypeMap.get('incident') || 0, color: '#ef4444' }
  ];

  // Alerts by type
  const alertTypeMap = new Map<string, number>();
  alerts.forEach(a => {
    alertTypeMap.set(a.type, (alertTypeMap.get(a.type) || 0) + 1);
  });
  const alertTypeData = [
    { label: t('nav.incidents'), value: alertTypeMap.get('incident') || 0, color: '#ef4444' },
    { label: t('products.currentStock'), value: alertTypeMap.get('stock') || 0, color: '#f59e0b' },
    { label: t('monitoringPoints.alerts'), value: alertTypeMap.get('alert') || 0, color: '#3b82f6' }
  ];

  // Alerts by priority
  const alertPriorityMap = new Map<string, number>();
  alerts.forEach(a => {
    alertPriorityMap.set(a.priority, (alertPriorityMap.get(a.priority) || 0) + 1);
  });
  const alertPriorityData = [
    { label: t('incidents.critical'), value: alertPriorityMap.get('critical') || 0, color: '#dc2626' },
    { label: t('incidents.high'), value: alertPriorityMap.get('high') || 0, color: '#f59e0b' },
    { label: t('incidents.medium'), value: alertPriorityMap.get('medium') || 0, color: '#3b82f6' },
    { label: t('incidents.low'), value: alertPriorityMap.get('low') || 0, color: '#6b7280' }
  ];

  // Summary bar chart
  const summaryData = [
    { label: t('systems.title'), value: stats.systems.total, color: '#3b82f6' },
    { label: t('nav.dailyLogs'), value: stats.dailyLogs.today, color: '#22c55e' },
    { label: t('dashboard.openIncidents'), value: stats.incidents.open, color: '#ef4444' },
    { label: t('dashboard.pendingInspections'), value: stats.inspections.pending, color: '#8b5cf6' },
    { label: t('products.minimumStock'), value: stats.products.lowStock, color: '#f59e0b' },
    { label: t('monitoringPoints.alerts'), value: stats.alerts.outOfRangeToday, color: '#ec4899' }
  ];

  // Activity by system
  const activitySystemMap = new Map<string, number>();
  recentActivity.forEach(a => {
    activitySystemMap.set(a.system, (activitySystemMap.get(a.system) || 0) + 1);
  });
  const activityBySystemData = Array.from(activitySystemMap.entries())
    .map(([label, value]) => ({
      label: label.length > 12 ? label.substring(0, 12) + '...' : label,
      value,
      color: '#3b82f6'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <Card title={t('dashboard.overview')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.systems.total}</p>
            <p className="text-sm text-blue-700">{t('systems.title')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats.dailyLogs.thisWeek}</p>
            <p className="text-sm text-green-700">{t('nav.dailyLogs')}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{stats.incidents.open}</p>
            <p className="text-sm text-red-700">{t('dashboard.openIncidents')}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{stats.users.total}</p>
            <p className="text-sm text-purple-700">{t('users.title')}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('systems.systemStatus')}>
          <div className="flex justify-center py-4">
            <DonutChart data={systemsData} title={t('systems.title')} size={200} />
          </div>
        </Card>

        <Card title={t('dashboard.recentLogs')}>
          <div className="flex justify-center py-4">
            <DonutChart data={activityTypeData} title={t('common.type')} size={200} />
          </div>
        </Card>
      </div>

      <Card title={t('dashboard.overview')}>
        <BarChart data={summaryData} title={t('dashboard.overview')} height={220} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('monitoringPoints.alerts')}>
          <div className="flex justify-center py-4">
            <DonutChart data={alertTypeData} title={t('common.type')} size={200} />
          </div>
        </Card>

        <Card title={t('incidents.severity')}>
          <div className="flex justify-center py-4">
            <DonutChart data={alertPriorityData} title={t('incidents.severity')} size={200} />
          </div>
        </Card>
      </div>

      {activityBySystemData.length > 0 && (
        <Card title={t('dashboard.recentLogs')}>
          <BarChart data={activityBySystemData} title={t('systems.title')} height={220} />
        </Card>
      )}
    </div>
  );
};

export default DashboardChartView;
