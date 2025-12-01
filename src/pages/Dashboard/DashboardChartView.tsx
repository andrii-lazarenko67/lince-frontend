import React from 'react';
import { Card } from '../../components/common';
import { DonutChart, BarChart } from '../../components/charts';
import type { DashboardStats, RecentActivity, Alert } from '../../types';

interface DashboardChartViewProps {
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  alerts: Alert[];
}

const DashboardChartView: React.FC<DashboardChartViewProps> = ({ stats, recentActivity, alerts }) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard data...</p>
      </div>
    );
  }

  // Systems status donut
  const systemsData = [
    { label: 'Active', value: stats.systems.active, color: '#22c55e' },
    { label: 'Inactive', value: stats.systems.total - stats.systems.active, color: '#6b7280' }
  ];

  // Activity by type
  const activityTypeMap = new Map<string, number>();
  recentActivity.forEach(a => {
    activityTypeMap.set(a.type, (activityTypeMap.get(a.type) || 0) + 1);
  });
  const activityTypeData = [
    { label: 'Daily Logs', value: activityTypeMap.get('dailyLog') || 0, color: '#3b82f6' },
    { label: 'Inspections', value: activityTypeMap.get('inspection') || 0, color: '#8b5cf6' },
    { label: 'Incidents', value: activityTypeMap.get('incident') || 0, color: '#ef4444' }
  ];

  // Alerts by type
  const alertTypeMap = new Map<string, number>();
  alerts.forEach(a => {
    alertTypeMap.set(a.type, (alertTypeMap.get(a.type) || 0) + 1);
  });
  const alertTypeData = [
    { label: 'Incidents', value: alertTypeMap.get('incident') || 0, color: '#ef4444' },
    { label: 'Stock', value: alertTypeMap.get('stock') || 0, color: '#f59e0b' },
    { label: 'Alerts', value: alertTypeMap.get('alert') || 0, color: '#3b82f6' }
  ];

  // Alerts by priority
  const alertPriorityMap = new Map<string, number>();
  alerts.forEach(a => {
    alertPriorityMap.set(a.priority, (alertPriorityMap.get(a.priority) || 0) + 1);
  });
  const alertPriorityData = [
    { label: 'Critical', value: alertPriorityMap.get('critical') || 0, color: '#dc2626' },
    { label: 'High', value: alertPriorityMap.get('high') || 0, color: '#f59e0b' },
    { label: 'Medium', value: alertPriorityMap.get('medium') || 0, color: '#3b82f6' },
    { label: 'Low', value: alertPriorityMap.get('low') || 0, color: '#6b7280' }
  ];

  // Summary bar chart
  const summaryData = [
    { label: 'Systems', value: stats.systems.total, color: '#3b82f6' },
    { label: 'Logs Today', value: stats.dailyLogs.today, color: '#22c55e' },
    { label: 'Open Issues', value: stats.incidents.open, color: '#ef4444' },
    { label: 'Pending Insp.', value: stats.inspections.pending, color: '#8b5cf6' },
    { label: 'Low Stock', value: stats.products.lowStock, color: '#f59e0b' },
    { label: 'Alerts', value: stats.alerts.outOfRangeToday, color: '#ec4899' }
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
      <Card title="Dashboard Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{stats.systems.total}</p>
            <p className="text-sm text-blue-700">Total Systems</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{stats.dailyLogs.thisWeek}</p>
            <p className="text-sm text-green-700">Logs This Week</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{stats.incidents.open}</p>
            <p className="text-sm text-red-700">Open Incidents</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{stats.users.total}</p>
            <p className="text-sm text-purple-700">Active Users</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Systems Status">
          <div className="flex justify-center py-4">
            <DonutChart data={systemsData} title="Active vs Inactive systems" size={200} />
          </div>
        </Card>

        <Card title="Recent Activity Types">
          <div className="flex justify-center py-4">
            <DonutChart data={activityTypeData} title="Activity breakdown" size={200} />
          </div>
        </Card>
      </div>

      <Card title="Key Metrics Summary">
        <BarChart data={summaryData} title="Overview of all key metrics" height={220} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Alerts by Type">
          <div className="flex justify-center py-4">
            <DonutChart data={alertTypeData} title="Distribution by alert type" size={200} />
          </div>
        </Card>

        <Card title="Alerts by Priority">
          <div className="flex justify-center py-4">
            <DonutChart data={alertPriorityData} title="Distribution by priority" size={200} />
          </div>
        </Card>
      </div>

      {activityBySystemData.length > 0 && (
        <Card title="Activity by System">
          <BarChart data={activityBySystemData} title="Recent activity per system" height={220} />
        </Card>
      )}
    </div>
  );
};

export default DashboardChartView;
