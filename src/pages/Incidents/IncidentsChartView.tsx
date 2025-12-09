import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common';
import { DonutChart, BarChart, LineChart } from '../../components/charts';
import type { Incident } from '../../types';

interface IncidentsChartViewProps {
  incidents: Incident[];
}

const IncidentsChartView: React.FC<IncidentsChartViewProps> = ({ incidents }) => {
  const { t } = useTranslation();
  const totalIncidents = incidents.length;

  // Status counts
  const openCount = incidents.filter(i => i.status === 'open').length;
  const inProgressCount = incidents.filter(i => i.status === 'in_progress').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;

  // Priority counts
  const criticalCount = incidents.filter(i => i.priority === 'critical').length;
  const highCount = incidents.filter(i => i.priority === 'high').length;
  const mediumCount = incidents.filter(i => i.priority === 'medium').length;
  const lowCount = incidents.filter(i => i.priority === 'low').length;

  // Status donut
  const statusData = [
    { label: t('incidents.charts.statusOpen'), value: openCount, color: '#ef4444' },
    { label: t('incidents.charts.statusInProgress'), value: inProgressCount, color: '#f59e0b' },
    { label: t('incidents.charts.statusResolved'), value: resolvedCount, color: '#22c55e' }
  ];

  // Priority donut
  const priorityData = [
    { label: t('incidents.charts.priorityCritical'), value: criticalCount, color: '#dc2626' },
    { label: t('incidents.charts.priorityHigh'), value: highCount, color: '#f59e0b' },
    { label: t('incidents.charts.priorityMedium'), value: mediumCount, color: '#3b82f6' },
    { label: t('incidents.charts.priorityLow'), value: lowCount, color: '#6b7280' }
  ];

  // Incidents by system
  const systemMap = new Map<string, number>();
  incidents.forEach(i => {
    const systemName = i.system?.name || t('incidents.charts.unknown');
    systemMap.set(systemName, (systemMap.get(systemName) || 0) + 1);
  });
  const bySystemData = Array.from(systemMap.entries())
    .map(([label, value]) => ({
      label: label.length > 12 ? label.substring(0, 12) + '...' : label,
      value,
      color: '#3b82f6'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Incidents over time (by date)
  const dateMap = new Map<string, number>();
  incidents.forEach(i => {
    const date = new Date(i.createdAt).toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  const overTimeData = Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([label, value]) => ({
      label: label.split('-').slice(1).join('/'),
      value
    }));

  // Incidents by reporter
  const reporterMap = new Map<string, number>();
  incidents.forEach(i => {
    const reporterName = i.reporter?.name || t('incidents.charts.unknown');
    reporterMap.set(reporterName, (reporterMap.get(reporterName) || 0) + 1);
  });
  const byReporterData = Array.from(reporterMap.entries())
    .map(([label, value]) => ({
      label: label.length > 12 ? label.substring(0, 12) + '...' : label,
      value,
      color: '#8b5cf6'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <Card title={t('incidents.charts.overviewCard')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalIncidents}</p>
            <p className="text-sm text-blue-700">{t('incidents.charts.totalIncidents')}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{openCount}</p>
            <p className="text-sm text-red-700">{t('incidents.charts.open')}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{inProgressCount}</p>
            <p className="text-sm text-yellow-700">{t('incidents.charts.inProgress')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{resolvedCount}</p>
            <p className="text-sm text-green-700">{t('incidents.charts.resolved')}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('incidents.charts.statusDistribution')}>
          <div className="flex justify-center py-4">
            <DonutChart data={statusData} title={t('incidents.charts.statusByStatus')} size={200} />
          </div>
        </Card>

        <Card title={t('incidents.charts.priorityDistribution')}>
          <div className="flex justify-center py-4">
            <DonutChart data={priorityData} title={t('incidents.charts.priorityByPriority')} size={200} />
          </div>
        </Card>
      </div>

      <Card title={t('incidents.charts.overTime')}>
        <LineChart data={overTimeData} title={t('incidents.charts.recentTrend')} height={220} color="#ef4444" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('incidents.charts.bySystem')}>
          <BarChart data={bySystemData} title={t('incidents.charts.incidentsPerSystem')} height={220} />
        </Card>

        <Card title={t('incidents.charts.byReporter')}>
          <BarChart data={byReporterData} title={t('incidents.charts.incidentsPerReporter')} height={220} />
        </Card>
      </div>
    </div>
  );
};

export default IncidentsChartView;
