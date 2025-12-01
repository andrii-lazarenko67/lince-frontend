import React from 'react';
import { Card } from '../../components/common';
import { DonutChart, BarChart, LineChart } from '../../components/charts';
import type { DailyLog } from '../../types';

interface DailyLogsChartViewProps {
  dailyLogs: DailyLog[];
}

const DailyLogsChartView: React.FC<DailyLogsChartViewProps> = ({ dailyLogs }) => {
  const totalLogs = dailyLogs.length;

  // Shift counts
  const morningCount = dailyLogs.filter(l => l.shift === 'morning').length;
  const afternoonCount = dailyLogs.filter(l => l.shift === 'afternoon').length;
  const nightCount = dailyLogs.filter(l => l.shift === 'night').length;

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

  // Shift donut
  const shiftData = [
    { label: 'Morning', value: morningCount, color: '#f59e0b' },
    { label: 'Afternoon', value: afternoonCount, color: '#3b82f6' },
    { label: 'Night', value: nightCount, color: '#6366f1' }
  ];

  // Entry status donut
  const entryStatusData = [
    { label: 'Normal', value: normalCount, color: '#22c55e' },
    { label: 'Out of Range', value: outOfRangeCount, color: '#ef4444' }
  ];

  // Logs by system
  const systemMap = new Map<string, number>();
  dailyLogs.forEach(log => {
    const systemName = log.system?.name || 'Unknown';
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
    const operatorName = log.user?.name || 'Unknown';
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
    const systemName = log.system?.name || 'Unknown';
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
      <Card title="Daily Logs Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalLogs}</p>
            <p className="text-sm text-blue-700">Total Logs</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{totalEntries}</p>
            <p className="text-sm text-green-700">Total Entries</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{outOfRangeCount}</p>
            <p className="text-sm text-red-700">Out of Range</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{systemMap.size}</p>
            <p className="text-sm text-purple-700">Systems Logged</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Logs by Shift">
          <div className="flex justify-center py-4">
            <DonutChart data={shiftData} title="Distribution by shift" size={200} />
          </div>
        </Card>

        <Card title="Entry Status">
          <div className="flex justify-center py-4">
            <DonutChart data={entryStatusData} title="Normal vs Out of Range" size={200} />
          </div>
        </Card>
      </div>

      <Card title="Daily Logs Over Time">
        <LineChart data={overTimeData} title="Recent logging activity" height={220} color="#3b82f6" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Logs by System">
          <BarChart data={bySystemData} title="Number of logs per system" height={220} />
        </Card>

        <Card title="Logs by Operator">
          <BarChart data={byOperatorData} title="Number of logs per operator" height={220} />
        </Card>
      </div>

      {outOfRangeBySystemData.length > 0 && (
        <Card title="Out of Range Entries by System">
          <BarChart data={outOfRangeBySystemData} title="Number of out-of-range entries per system" height={220} defaultColor="#ef4444" />
        </Card>
      )}
    </div>
  );
};

export default DailyLogsChartView;
