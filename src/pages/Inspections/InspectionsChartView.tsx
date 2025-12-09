import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common';
import { DonutChart, BarChart, LineChart, HorizontalBarChart } from '../../components/charts';
import type { Inspection } from '../../types';

interface InspectionsChartViewProps {
  inspections: Inspection[];
}

const InspectionsChartView: React.FC<InspectionsChartViewProps> = ({ inspections }) => {
  const { t } = useTranslation();
  const totalInspections = inspections.length;

  // Status counts
  const pendingCount = inspections.filter(i => i.status === 'pending').length;
  const completedCount = inspections.filter(i => i.status === 'completed').length;
  const approvedCount = inspections.filter(i => i.status === 'approved').length;

  // Count all inspection items by actual status values (C, NC, NA, NV)
  let totalC = 0;   // Conforme (Compliant)
  let totalNC = 0;  // No Conforme (Non-Compliant)
  let totalNA = 0;  // No Aplica (Not Applicable)
  let totalNV = 0;  // No Verificado (Not Verified)
  inspections.forEach(i => {
    i.items?.forEach(item => {
      if (item.status === 'C') totalC++;
      else if (item.status === 'NC') totalNC++;
      else if (item.status === 'NA') totalNA++;
      else if (item.status === 'NV') totalNV++;
    });
  });

  // Status donut
  const statusData = [
    { label: t('inspections.charts.statusPending'), value: pendingCount, color: '#f59e0b' },
    { label: t('inspections.charts.statusCompleted'), value: completedCount, color: '#3b82f6' },
    { label: t('inspections.charts.statusApproved'), value: approvedCount, color: '#22c55e' }
  ];

  // Item results donut - using actual status values
  const itemResultsData = [
    { label: t('inspections.charts.compliantC'), value: totalC, color: '#22c55e' },
    { label: t('inspections.charts.nonCompliantNC'), value: totalNC, color: '#ef4444' },
    { label: t('inspections.charts.notApplicableNA'), value: totalNA, color: '#6b7280' },
    { label: t('inspections.charts.notVerifiedNV'), value: totalNV, color: '#f59e0b' }
  ];

  // Inspections by system
  const systemMap = new Map<string, number>();
  inspections.forEach(i => {
    const systemName = i.system?.name || t('inspections.charts.unknown');
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

  // Inspections over time
  const dateMap = new Map<string, number>();
  inspections.forEach(i => {
    const date = new Date(i.date).toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  const overTimeData = Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([label, value]) => ({
      label: label.split('-').slice(1).join('/'),
      value
    }));

  // Inspections by inspector
  const inspectorMap = new Map<string, number>();
  inspections.forEach(i => {
    const inspectorName = i.user?.name || t('inspections.charts.unknown');
    inspectorMap.set(inspectorName, (inspectorMap.get(inspectorName) || 0) + 1);
  });
  const byInspectorData = Array.from(inspectorMap.entries())
    .map(([label, value]) => ({
      label: label.length > 12 ? label.substring(0, 12) + '...' : label,
      value,
      color: '#8b5cf6'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Item results by system - using actual status values
  const systemItemMap = new Map<string, { pass: number; fail: number; na: number }>();
  inspections.forEach(i => {
    const systemName = i.system?.name || t('inspections.charts.unknown');
    const current = systemItemMap.get(systemName) || { pass: 0, fail: 0, na: 0 };
    i.items?.forEach(item => {
      if (item.status === 'C') current.pass++;
      else if (item.status === 'NC') current.fail++;
      else current.na++; // NA and NV count as N/A for the chart
    });
    systemItemMap.set(systemName, current);
  });
  const itemsBySystemData = Array.from(systemItemMap.entries())
    .map(([label, data]) => ({
      label: label.length > 15 ? label.substring(0, 15) + '...' : label,
      ...data
    }))
    .sort((a, b) => (b.pass + b.fail + b.na) - (a.pass + a.fail + a.na));

  return (
    <div className="space-y-6">
      <Card title={t('inspections.charts.overviewCard')}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalInspections}</p>
            <p className="text-sm text-blue-700">{t('inspections.charts.totalInspections')}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-yellow-700">{t('inspections.charts.pending')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-green-700">{t('inspections.charts.approved')}</p>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <p className="text-3xl font-bold text-emerald-600">{totalC}</p>
            <p className="text-sm text-emerald-700">{t('inspections.charts.compliant')}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{totalNC}</p>
            <p className="text-sm text-red-700">{t('inspections.charts.nonCompliant')}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('inspections.charts.statusDistribution')}>
          <div className="flex justify-center py-4">
            <DonutChart data={statusData} title={t('inspections.charts.inspectionsByStatus')} size={200} />
          </div>
        </Card>

        <Card title={t('inspections.charts.checklistResults')}>
          <div className="flex justify-center py-4">
            <DonutChart data={itemResultsData} title={t('inspections.charts.allChecklistItems')} size={200} />
          </div>
        </Card>
      </div>

      <Card title={t('inspections.charts.overTime')}>
        <LineChart data={overTimeData} title={t('inspections.charts.recentTrend')} height={220} color="#3b82f6" />
      </Card>

      <Card title={t('inspections.charts.resultsBySystem')}>
        <HorizontalBarChart data={itemsBySystemData} title={t('inspections.charts.breakdownPerSystem')} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('inspections.charts.bySystem')}>
          <BarChart data={bySystemData} title={t('inspections.charts.inspectionsPerSystem')} height={220} />
        </Card>

        <Card title={t('inspections.charts.byInspector')}>
          <BarChart data={byInspectorData} title={t('inspections.charts.inspectionsPerInspector')} height={220} />
        </Card>
      </div>
    </div>
  );
};

export default InspectionsChartView;
