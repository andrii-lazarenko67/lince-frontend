import React from 'react';
import { Card } from '../../../components/common';
import type { ReportData } from '../../../types';

interface ReportInspectionsProps {
  report: ReportData;
}

// Donut Chart Component
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title, size = 180 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <div className="rounded-full bg-gray-100 flex items-center justify-center" style={{ width: size, height: size }}>
          <span className="text-gray-400 text-sm">No data</span>
        </div>
        <p className="text-sm font-medium text-gray-700 mt-3">{title}</p>
      </div>
    );
  }

  let currentAngle = -90;
  const segments = data.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const segment = { ...item, percentage, startAngle: currentAngle, endAngle: currentAngle + angle };
    currentAngle += angle;
    return segment;
  });

  const createArcPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = radius + radius * Math.cos(startRad);
    const y1 = radius + radius * Math.sin(startRad);
    const x2 = radius + radius * Math.cos(endRad);
    const y2 = radius + radius * Math.sin(endRad);
    const x3 = radius + innerRadius * Math.cos(endRad);
    const y3 = radius + innerRadius * Math.sin(endRad);
    const x4 = radius + innerRadius * Math.cos(startRad);
    const y4 = radius + innerRadius * Math.sin(startRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  const radius = size / 2;
  const innerRadius = radius * 0.6;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, index) => (
          segment.value > 0 && (
            <path key={index} d={createArcPath(segment.startAngle, segment.endAngle, radius - 2, innerRadius)} fill={segment.color} className="transition-opacity hover:opacity-80" />
          )
        ))}
        <text x={radius} y={radius - 8} textAnchor="middle" style={{ fontSize: '24px', fontWeight: 'bold', fill: '#374151' }}>{total}</text>
        <text x={radius} y={radius + 12} textAnchor="middle" style={{ fontSize: '12px', fill: '#6b7280' }}>Total</text>
      </svg>
      <p className="text-sm font-medium text-gray-700 mt-3">{title}</p>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {segments.map((segment, index) => (
          segment.value > 0 && (
            <div key={index} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-xs text-gray-600">{segment.label}: {segment.value} ({segment.percentage.toFixed(0)}%)</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

// Bar Chart Component
interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      <div className="flex items-end justify-around gap-2" style={{ height }}>
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 max-w-[60px]">
            <span className="text-xs font-medium text-gray-600 mb-1">{item.value}</span>
            <div
              className="w-full rounded-t transition-all hover:opacity-80"
              style={{
                height: `${(item.value / maxValue) * (height - 40)}px`,
                backgroundColor: item.color || '#3b82f6',
                minHeight: item.value > 0 ? '4px' : '0'
              }}
            />
            <span className="text-xs text-gray-500 mt-2 text-center truncate w-full">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Horizontal Bar Chart for Item Status
interface HorizontalBarChartProps {
  data: { label: string; pass: number; fail: number; na: number }[];
  title: string;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ data, title }) => {
  if (data.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center h-48 text-gray-400">No data</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      <div className="space-y-3">
        {data.slice(0, 10).map((item, index) => {
          const total = item.pass + item.fail + item.na;
          if (total === 0) return null;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-700 truncate max-w-[150px]">{item.label}</span>
                <span className="text-gray-500">{total} items</span>
              </div>
              <div className="flex h-4 rounded overflow-hidden">
                {item.pass > 0 && (
                  <div className="bg-green-500" style={{ width: `${(item.pass / total) * 100}%` }} title={`Pass: ${item.pass}`} />
                )}
                {item.fail > 0 && (
                  <div className="bg-red-500" style={{ width: `${(item.fail / total) * 100}%` }} title={`Fail: ${item.fail}`} />
                )}
                {item.na > 0 && (
                  <div className="bg-gray-400" style={{ width: `${(item.na / total) * 100}%` }} title={`N/A: ${item.na}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /><span className="text-xs text-gray-600">Pass</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500" /><span className="text-xs text-gray-600">Fail</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-gray-400" /><span className="text-xs text-gray-600">N/A</span></div>
      </div>
    </div>
  );
};

// Line Chart Component
interface LineChartProps {
  data: { label: string; value: number }[];
  title: string;
  height?: number;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title, height = 200, color = '#3b82f6' }) => {
  if (data.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center bg-gray-50 rounded" style={{ height }}>
          <span className="text-gray-400">No data</span>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = height - 40;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = chartHeight - (item.value / maxValue) * chartHeight;
    return { x, y, ...item };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      <svg width="100%" height={height} viewBox={`-5 -10 110 ${height}`} preserveAspectRatio="none">
        {[0, 25, 50, 75, 100].map(percent => (
          <line key={percent} x1="0" y1={chartHeight * (1 - percent / 100)} x2="100" y2={chartHeight * (1 - percent / 100)} stroke="#e5e7eb" strokeWidth="0.5" />
        ))}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
        ))}
      </svg>
      <div className="flex justify-between mt-2 px-1">
        {data.length <= 7 ? data.map((item, i) => (
          <span key={i} className="text-xs text-gray-500">{item.label}</span>
        )) : (
          <>
            <span className="text-xs text-gray-500">{data[0]?.label}</span>
            <span className="text-xs text-gray-500">{data[data.length - 1]?.label}</span>
          </>
        )}
      </div>
    </div>
  );
};

const ReportInspections: React.FC<ReportInspectionsProps> = ({ report }) => {
  // Status counts
  const pendingCount = report.inspections.filter(i => i.status === 'pending').length;
  const completedCount = report.inspections.filter(i => i.status === 'completed').length;
  const approvedCount = report.inspections.filter(i => i.status === 'approved').length;

  // Status donut chart
  const statusData = [
    { label: 'Approved', value: approvedCount, color: '#22c55e' },
    { label: 'Completed', value: completedCount, color: '#3b82f6' },
    { label: 'Pending', value: pendingCount, color: '#eab308' }
  ];

  // Items status counts
  let totalPass = 0, totalFail = 0, totalNa = 0;
  report.inspections.forEach(insp => {
    insp.items?.forEach(item => {
      if (item.status === 'pass') totalPass++;
      else if (item.status === 'fail') totalFail++;
      else if (item.status === 'na') totalNa++;
    });
  });

  const itemsStatusData = [
    { label: 'Pass', value: totalPass, color: '#22c55e' },
    { label: 'Fail', value: totalFail, color: '#ef4444' },
    { label: 'N/A', value: totalNa, color: '#9ca3af' }
  ];

  // Inspections by system
  const systemMap = new Map<string, number>();
  report.inspections.forEach(insp => {
    const systemName = insp.system?.name || 'Unknown';
    systemMap.set(systemName, (systemMap.get(systemName) || 0) + 1);
  });
  const bySystemData = Array.from(systemMap.entries()).map(([label, value]) => ({
    label: label.length > 10 ? label.substring(0, 10) + '...' : label,
    value,
    color: '#3b82f6'
  }));

  // Inspections by user
  const userMap = new Map<string, number>();
  report.inspections.forEach(insp => {
    const userName = insp.user?.name || 'Unknown';
    userMap.set(userName, (userMap.get(userName) || 0) + 1);
  });
  const byUserData = Array.from(userMap.entries()).map(([label, value]) => ({
    label: label.length > 10 ? label.substring(0, 10) + '...' : label,
    value,
    color: '#8b5cf6'
  }));

  // Inspections over time
  const timeMap = new Map<string, number>();
  report.inspections.forEach(insp => {
    const date = new Date(insp.date).toISOString().split('T')[0];
    timeMap.set(date, (timeMap.get(date) || 0) + 1);
  });
  const overTimeData = Array.from(timeMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label: label.split('-').slice(1).join('/'), value }));

  // Items status by system
  const systemItemsMap = new Map<string, { pass: number; fail: number; na: number }>();
  report.inspections.forEach(insp => {
    const systemName = insp.system?.name || 'Unknown';
    const current = systemItemsMap.get(systemName) || { pass: 0, fail: 0, na: 0 };
    insp.items?.forEach(item => {
      if (item.status === 'pass') current.pass++;
      else if (item.status === 'fail') current.fail++;
      else current.na++;
    });
    systemItemsMap.set(systemName, current);
  });
  const itemsBySystemData = Array.from(systemItemsMap.entries()).map(([label, data]) => ({
    label,
    ...data
  }));

  return (
    <div className="space-y-6">
      <Card title="Inspections Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{report.inspections.length}</p>
            <p className="text-sm text-blue-700">Total Inspections</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-green-700">Approved</p>
          </div>
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-3xl font-bold text-indigo-600">{completedCount}</p>
            <p className="text-sm text-indigo-700">Completed</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-yellow-700">Pending</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Inspection Status">
          <div className="flex justify-center py-4">
            <DonutChart data={statusData} title="By Status" size={200} />
          </div>
        </Card>

        <Card title="Checklist Items Status">
          <div className="flex justify-center py-4">
            <DonutChart data={itemsStatusData} title="Pass / Fail / N/A" size={200} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Inspections by System">
          {bySystemData.length > 0 ? (
            <BarChart data={bySystemData} title="Number per system" height={220} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No data</div>
          )}
        </Card>

        <Card title="Inspections by User">
          {byUserData.length > 0 ? (
            <BarChart data={byUserData} title="Number per user" height={220} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No data</div>
          )}
        </Card>
      </div>

      <Card title="Inspections Over Time">
        <LineChart data={overTimeData} title="Inspection trend" height={200} color="#3b82f6" />
      </Card>

      <Card title="Checklist Results by System">
        <HorizontalBarChart data={itemsBySystemData} title="Pass/Fail/N/A breakdown" />
      </Card>
    </div>
  );
};

export default ReportInspections;
