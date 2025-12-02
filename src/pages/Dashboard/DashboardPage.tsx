import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import { ExportDropdown, ViewModeToggle } from '../../components/common';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import StatsSection from './StatsSection';
import RecentActivitySection from './RecentActivitySection';
import AlertsSection from './AlertsSection';
import DashboardChartView from './DashboardChartView';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { stats, recentActivity, alerts } = useAppSelector((state) => state.dashboard);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'dailyLog': return 'Daily Log';
      case 'inspection': return 'Inspection';
      case 'incident': return 'Incident';
      default: return type;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'incident': return 'Incident';
      case 'stock': return 'Low Stock';
      case 'alert': return 'Alert';
      default: return type;
    }
  };

  const getExportSections = () => {
    const sections = [];

    // Stats Summary Section
    if (stats) {
      sections.push({
        title: 'Statistics Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Systems', String(stats.systems.total)],
          ['Active Systems', String(stats.systems.active)],
          ['Total Users', String(stats.users.total)],
          ['Daily Logs Today', String(stats.dailyLogs.today)],
          ['Daily Logs This Week', String(stats.dailyLogs.thisWeek)],
          ['Open Incidents', String(stats.incidents.open)],
          ['Incidents This Week', String(stats.incidents.thisWeek)],
          ['Pending Inspections', String(stats.inspections.pending)],
          ['Inspections This Week', String(stats.inspections.thisWeek)],
          ['Low Stock Products', String(stats.products.lowStock)],
          ['Unread Notifications', String(stats.alerts.unreadNotifications)],
          ['Out of Range Today', String(stats.alerts.outOfRangeToday)]
        ]
      });
    }

    // Recent Activity Section
    if (recentActivity.length > 0) {
      sections.push({
        title: `Recent Activity (${recentActivity.length})`,
        headers: ['Type', 'Title', 'System', 'User', 'Status', 'Date'],
        rows: recentActivity.map(activity => [
          getActivityTypeLabel(activity.type),
          activity.title,
          activity.system,
          activity.user,
          activity.status || '-',
          new Date(activity.date).toLocaleString()
        ])
      });
    }

    // Alerts Section
    if (alerts.length > 0) {
      sections.push({
        title: `Alerts (${alerts.length})`,
        headers: ['Type', 'Priority', 'Title', 'Message', 'Created'],
        rows: alerts.map(alert => [
          getAlertTypeLabel(alert.type),
          alert.priority,
          alert.title,
          alert.message,
          new Date(alert.createdAt).toLocaleString()
        ])
      });
    }

    return sections;
  };

  const handleExportPDF = () => {
    const sections = getExportSections();
    exportToPdf(
      {
        title: 'Dashboard Report',
        subtitle: 'LINCE Water Treatment System',
        filename: `dashboard-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Open Incidents', value: String(stats?.incidents.open || 0) },
          { label: 'Low Stock Items', value: String(stats?.products.lowStock || 0) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      sections
    );
  };

  const handleExportHTML = () => {
    const sections = getExportSections();
    exportToHtml(
      {
        title: 'Dashboard Report',
        filename: `dashboard-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Open Incidents', value: String(stats?.incidents.open || 0) },
          { label: 'Low Stock Items', value: String(stats?.products.lowStock || 0) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      sections
    );
  };

  const handleExportCSV = () => {
    const sections = getExportSections();
    exportToCsv(
      {
        title: 'Dashboard Report',
        filename: `dashboard-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Open Incidents', value: String(stats?.incidents.open || 0) },
          { label: 'Low Stock Items', value: String(stats?.products.lowStock || 0) },
          { label: 'Generated', value: new Date().toISOString() }
        ]
      },
      sections
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'User'}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <ViewModeToggle
            value={viewMode}
            onChange={setViewMode}
            tableLabel="Cards"
          />
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportHTML={handleExportHTML}
            onExportCSV={handleExportCSV}
            disabled={!stats}
          />
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <StatsSection />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivitySection />
            <AlertsSection />
          </div>
        </>
      ) : (
        <DashboardChartView stats={stats} recentActivity={recentActivity} alerts={alerts} />
      )}
    </div>
  );
};

export default DashboardPage;
