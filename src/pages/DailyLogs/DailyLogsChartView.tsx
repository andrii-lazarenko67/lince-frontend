import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common';
import { DonutChart, BarChart, LineChart } from '../../components/charts';
import type { DailyLog } from '../../types';

interface DailyLogsChartViewProps {
  dailyLogs: DailyLog[];
}

const DailyLogsChartView: React.FC<DailyLogsChartViewProps> = ({ dailyLogs }) => {
  const { t } = useTranslation();
  const totalLogs = dailyLogs.length;

  // Record type counts
  const fieldCount = dailyLogs.filter(l => l.recordType === 'field').length;
  const laboratoryCount = dailyLogs.filter(l => l.recordType === 'laboratory').length;

  // Period counts (using period field)
  const periodMap = new Map<string, number>();
  dailyLogs.forEach(log => {
    const period = log.period || t('dailyLogs.chart.notSpecified');
    periodMap.set(period, (periodMap.get(period) || 0) + 1);
  });
  const periodColors = ['#f59e0b', '#3b82f6', '#6366f1', '#22c55e', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];
  const periodData = Array.from(periodMap.entries())
    .map(([label, value], index) => ({
      label: label.length > 15 ? label.substring(0, 15) + '...' : label,
      value,
      color: periodColors[index % periodColors.length]
    }))
    .sort((a, b) => b.value - a.value);

  // Count entries with out of range values
  let totalEntries = 0;
  let outOfRangeCount = 0;
  dailyLogs.forEach(log => {
    log.entries?.forEach(entry => {
      totalEntries++;
      if (entry.isOutOfRange) outOfRangeCount++;
    });
  });
  const normalCount = totalEntries - outOfRangeCount;

  // Record type donut
  const recordTypeData = [
    { label: t('dailyLogs.chart.field'), value: fieldCount, color: '#3b82f6' },
    { label: t('dailyLogs.chart.laboratory'), value: laboratoryCount, color: '#8b5cf6' }
  ];

  // Entry status donut
  const entryStatusData = [
    { label: t('dailyLogs.chart.normal'), value: normalCount, color: '#22c55e' },
    { label: t('dailyLogs.chart.outOfRange'), value: outOfRangeCount, color: '#ef4444' }
  ];

  // Logs by system
  const systemMap = new Map<string, number>();
  dailyLogs.forEach(log => {
    const systemName = log.system?.name || t('dailyLogs.chart.unknown');
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

  // Logs over time
  const dateMap = new Map<string, number>();
  dailyLogs.forEach(log => {
    const date = new Date(log.date).toISOString().split('T')[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });
  const overTimeData = Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-14)
    .map(([label, value]) => ({
      label: label.split('-').slice(1).join('/'),
      value
    }));

  // Logs by operator
  const operatorMap = new Map<string, number>();
  dailyLogs.forEach(log => {
    const operatorName = log.user?.name || t('dailyLogs.chart.unknown');
    operatorMap.set(operatorName, (operatorMap.get(operatorName) || 0) + 1);
  });
  const byOperatorData = Array.from(operatorMap.entries())
    .map(([label, value]) => ({
      label: label.length > 12 ? label.substring(0, 12) + '...' : label,
      value,
      color: '#8b5cf6'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Out of range by system
  const systemOutOfRangeMap = new Map<string, number>();
  dailyLogs.forEach(log => {
    const systemName = log.system?.name || t('dailyLogs.chart.unknown');
    const outOfRange = log.entries?.filter(e => e.isOutOfRange).length || 0;
    systemOutOfRangeMap.set(systemName, (systemOutOfRangeMap.get(systemName) || 0) + outOfRange);
  });
  const outOfRangeBySystemData = Array.from(systemOutOfRangeMap.entries())
    .map(([label, value]) => ({
      label: label.length > 12 ? label.substring(0, 12) + '...' : label,
      value,
      color: '#ef4444'
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <Card title={t('dailyLogs.chart.overview')}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalLogs}</p>
            <p className="text-sm text-blue-700">{t('dailyLogs.chart.totalLogs')}</p>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-3xl font-bold text-indigo-600">{fieldCount}</p>
            <p className="text-sm text-indigo-700">{t('dailyLogs.chart.fieldRecords')}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{laboratoryCount}</p>
            <p className="text-sm text-purple-700">{t('dailyLogs.chart.labRecords')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{totalEntries}</p>
            <p className="text-sm text-green-700">{t('dailyLogs.chart.totalEntries')}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{outOfRangeCount}</p>
            <p className="text-sm text-red-700">{t('dailyLogs.chart.outOfRange')}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title={t('dailyLogs.chart.recordTypes')}>
          <div className="flex justify-center py-4">
            <DonutChart data={recordTypeData} title={t('dailyLogs.chart.fieldVsLab')} size={180} />
          </div>
        </Card>

        <Card title={t('dailyLogs.chart.byPeriod')}>
          <div className="flex justify-center py-4">
            <DonutChart data={periodData} title={t('dailyLogs.chart.distributionByPeriod')} size={180} />
          </div>
        </Card>

        <Card title={t('dailyLogs.chart.entryStatus')}>
          <div className="flex justify-center py-4">
            <DonutChart data={entryStatusData} title={t('dailyLogs.chart.normalVsOutOfRange')} size={180} />
          </div>
        </Card>
      </div>

      <Card title={t('dailyLogs.chart.overTime')}>
        <LineChart data={overTimeData} title={t('dailyLogs.chart.recentActivity')} height={220} color="#3b82f6" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('dailyLogs.chart.bySystem')}>
          <BarChart data={bySystemData} title={t('dailyLogs.chart.logsPerSystem')} height={220} />
        </Card>

        <Card title={t('dailyLogs.chart.byOperator')}>
          <BarChart data={byOperatorData} title={t('dailyLogs.chart.logsPerOperator')} height={220} />
        </Card>
      </div>

      {outOfRangeBySystemData.length > 0 && (
        <Card title={t('dailyLogs.chart.outOfRangeBySystem')}>
          <BarChart data={outOfRangeBySystemData} title={t('dailyLogs.chart.outOfRangeEntriesPerSystem')} height={220} defaultColor="#ef4444" />
        </Card>
      )}
    </div>
  );
};

export default DailyLogsChartView;
