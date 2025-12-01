import React from 'react';
import { Card } from '../../components/common';
import { DonutChart, BarChart, LineChart, HorizontalBarChart } from '../../components/charts';
import type { Inspection } from '../../types';

interface InspectionsChartViewProps {
  inspections: Inspection[];
}

const InspectionsChartView: React.FC<InspectionsChartViewProps> = ({ inspections }) => {
  const totalInspections = inspections.length;

  // Status counts
  const pendingCount = inspections.filter(i => i.status === 'pending').length;
  const completedCount = inspections.filter(i => i.status === 'completed').length;
  const approvedCount = inspections.filter(i => i.status === 'approved').length;

  // Count all inspection items
  let totalPass = 0;
  let totalFail = 0;
  let totalNA = 0;
  inspections.forEach(i => {
    i.items?.forEach(item => {
      if (item.status === 'pass') totalPass++;
      else if (item.status === 'fail') totalFail++;
      else totalNA++;
    });
  });

  // Status donut
  const statusData = [
    { label: 'Pending', value: pendingCount, color: '#f59e0b' },
    { label: 'Completed', value: completedCount, color: '#3b82f6' },
    { label: 'Approved', value: approvedCount, color: '#22c55e' }
  ];

  // Item results donut
  const itemResultsData = [
    { label: 'Pass', value: totalPass, color: '#22c55e' },
    { label: 'Fail', value: totalFail, color: '#ef4444' },
    { label: 'N/A', value: totalNA, color: '#6b7280' }
  ];

  // Inspections by system
  const systemMap = new Map<string, number>();
  inspections.forEach(i => {
    const systemName = i.system?.name || 'Unknown';
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
    const inspectorName = i.user?.name || 'Unknown';
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

  // Item results by system
  const systemItemMap = new Map<string, { pass: number; fail: number; na: number }>();
  inspections.forEach(i => {
    const systemName = i.system?.name || 'Unknown';
    const current = systemItemMap.get(systemName) || { pass: 0, fail: 0, na: 0 };
    i.items?.forEach(item => {
      if (item.status === 'pass') current.pass++;
      else if (item.status === 'fail') current.fail++;
      else current.na++;
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
      <Card title="Inspections Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalInspections}</p>
            <p className="text-sm text-blue-700">Total Inspections</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-green-700">Approved</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{totalFail}</p>
            <p className="text-sm text-red-700">Failed Items</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Status Distribution">
          <div className="flex justify-center py-4">
            <DonutChart data={statusData} title="Inspections by status" size={200} />
          </div>
        </Card>

        <Card title="Checklist Results">
          <div className="flex justify-center py-4">
            <DonutChart data={itemResultsData} title="All checklist items" size={200} />
          </div>
        </Card>
      </div>

      <Card title="Inspections Over Time">
        <LineChart data={overTimeData} title="Recent inspections trend" height={220} color="#3b82f6" />
      </Card>

      <Card title="Checklist Results by System">
        <HorizontalBarChart data={itemsBySystemData} title="Pass/Fail/N/A breakdown per system" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Inspections by System">
          <BarChart data={bySystemData} title="Number of inspections per system" height={220} />
        </Card>

        <Card title="Inspections by Inspector">
          <BarChart data={byInspectorData} title="Number of inspections per inspector" height={220} />
        </Card>
      </div>
    </div>
  );
};

export default InspectionsChartView;
