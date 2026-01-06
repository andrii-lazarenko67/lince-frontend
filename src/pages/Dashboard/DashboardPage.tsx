import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import { ExportDropdown, ViewModeToggle } from '../../components/common';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import StatsSection from './StatsSection';
import RecentActivitySection from './RecentActivitySection';
import AlertsSection from './AlertsSection';
import DashboardChartView from './DashboardChartView';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedClientId } = useAppSelector((state) => state.clients);
  const { stats, recentActivity, alerts } = useAppSelector((state) => state.dashboard);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch, selectedClientId]);

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'dailyLog': return t('nav.dailyLogs');
      case 'inspection': return t('nav.inspections');
      case 'incident': return t('nav.incidents');
      default: return type;
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'incident': return t('nav.incidents');
      case 'stock': return t('products.minimumStock');
      case 'alert': return t('monitoringPoints.alerts');
      default: return type;
    }
  };

  const getExportSections = () => {
    const sections = [];

    // Stats Summary Section
    if (stats) {
      sections.push({
        title: t('dashboard.overview'),
        headers: [t('common.name'), t('dailyLogs.value')],
        rows: [
          [t('systems.title'), String(stats.systems.total)],
          [t('dashboard.activeSystems'), String(stats.systems.active)],
          [t('users.title'), String(stats.users.total)],
          [t('nav.dailyLogs'), String(stats.dailyLogs.today)],
          [t('nav.dailyLogs'), String(stats.dailyLogs.thisWeek)],
          [t('dashboard.openIncidents'), String(stats.incidents.open)],
          [t('incidents.title'), String(stats.incidents.thisWeek)],
          [t('dashboard.pendingInspections'), String(stats.inspections.pending)],
          [t('inspections.title'), String(stats.inspections.thisWeek)],
          [t('products.minimumStock'), String(stats.products.lowStock)],
          [t('monitoringPoints.alerts'), String(stats.alerts.unreadNotifications)],
          [t('dailyLogs.outOfRange'), String(stats.alerts.outOfRangeToday)]
        ]
      });
    }

    // Recent Activity Section
    if (recentActivity.length > 0) {
      sections.push({
        title: `${t('dashboard.recentLogs')} (${recentActivity.length})`,
        headers: [t('common.type'), t('common.name'), t('dailyLogs.system'), t('users.title'), t('common.status'), t('common.date')],
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
        title: `${t('monitoringPoints.alerts')} (${alerts.length})`,
        headers: [t('common.type'), t('incidents.severity'), t('common.name'), t('common.description'), t('systems.createdAt')],
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
        title: t('dashboard.title'),
        subtitle: t('common.exportFooter'),
        filename: `dashboard-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('dashboard.openIncidents'), value: String(stats?.incidents.open || 0) },
          { label: t('products.minimumStock'), value: String(stats?.products.lowStock || 0) },
          { label: t('common.date'), value: new Date().toLocaleString() }
        ],
        footerText: `${t('common.exportFooter')} - ${new Date().toLocaleString()}`
      },
      sections
    );
  };

  const handleExportHTML = () => {
    const sections = getExportSections();
    exportToHtml(
      {
        title: t('dashboard.title'),
        filename: `dashboard-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('dashboard.openIncidents'), value: String(stats?.incidents.open || 0) },
          { label: t('products.minimumStock'), value: String(stats?.products.lowStock || 0) },
          { label: t('common.date'), value: new Date().toLocaleString() }
        ]
      },
      sections
    );
  };

  const handleExportCSV = () => {
    const sections = getExportSections();
    exportToCsv(
      {
        title: t('dashboard.title'),
        filename: `dashboard-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('dashboard.openIncidents'), value: String(stats?.incidents.open || 0) },
          { label: t('products.minimumStock'), value: String(stats?.products.lowStock || 0) },
          { label: t('common.date'), value: new Date().toISOString() }
        ]
      },
      sections
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-1">{t('dashboard.welcome')}, {user?.name || t('users.title')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <ViewModeToggle
            value={viewMode}
            onChange={setViewMode}
            tableLabel={t('dashboard.overview')}
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
