import React from 'react';
import { Card } from '../../../components/common';
import type { ReportData } from '../../../types';

interface ReportIncidentsProps {
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

// Stacked Bar Chart for priority by system
interface StackedBarChartProps {
  data: { label: string; critical: number; high: number; medium: number; low: number }[];
  title: string;
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data, title }) => {
  if (data.length === 0) {
    return (
      <div className="w-full">
        <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
        <div className="flex items-center justify-center h-48 text-gray-400">No data</div>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.critical + d.high + d.medium + d.low), 1);

  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-700 mb-4">{title}</p>
      <div className="space-y-3">
        {data.slice(0, 8).map((item, index) => {
          const total = item.critical + item.high + item.medium + item.low;
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-700 truncate max-w-[150px]">{item.label}</span>
                <span className="text-gray-500">{total}</span>
              </div>
              <div className="flex h-5 rounded overflow-hidden bg-gray-100" style={{ width: `${(total / maxTotal) * 100}%`, minWidth: total > 0 ? '20px' : '0' }}>
                {item.critical > 0 && <div className="bg-red-600" style={{ width: `${(item.critical / total) * 100}%` }} />}
                {item.high > 0 && <div className="bg-orange-500" style={{ width: `${(item.high / total) * 100}%` }} />}
                {item.medium > 0 && <div className="bg-yellow-500" style={{ width: `${(item.medium / total) * 100}%` }} />}
                {item.low > 0 && <div className="bg-green-500" style={{ width: `${(item.low / total) * 100}%` }} />}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-600" /><span className="text-xs text-gray-600">Critical</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-orange-500" /><span className="text-xs text-gray-600">High</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-yellow-500" /><span className="text-xs text-gray-600">Medium</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500" /><span className="text-xs text-gray-600">Low</span></div>
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

const ReportIncidents: React.FC<ReportIncidentsProps> = ({ report }) => {
  // Status counts
  const openCount = report.incidents.filter(i => i.status === 'open').length;
  const inProgressCount = report.incidents.filter(i => i.status === 'in_progress').length;
  const resolvedCount = report.incidents.filter(i => i.status === 'resolved').length;
  const closedCount = report.incidents.filter(i => i.status === 'closed').length;

  // Priority counts
  const criticalCount = report.incidents.filter(i => i.priority === 'critical').length;
  const highCount = report.incidents.filter(i => i.priority === 'high').length;
  const mediumCount = report.incidents.filter(i => i.priority === 'medium').length;
  const lowCount = report.incidents.filter(i => i.priority === 'low').length;

  // Status donut chart
  const statusData = [
    { label: 'Open', value: openCount, color: '#ef4444' },
    { label: 'In Progress', value: inProgressCount, color: '#eab308' },
    { label: 'Resolved', value: resolvedCount, color: '#22c55e' },
    { label: 'Closed', value: closedCount, color: '#6b7280' }
  ];

  // Priority donut chart
  const priorityData = [
    { label: 'Critical', value: criticalCount, color: '#dc2626' },
    { label: 'High', value: highCount, color: '#f97316' },
    { label: 'Medium', value: mediumCount, color: '#eab308' },
    { label: 'Low', value: lowCount, color: '#22c55e' }
  ];

  // Incidents by system
  const systemMap = new Map<string, number>();
  report.incidents.forEach(inc => {
    const systemName = inc.system?.name || 'Unknown';
    systemMap.set(systemName, (systemMap.get(systemName) || 0) + 1);
  });
  const bySystemData = Array.from(systemMap.entries()).map(([label, value]) => ({
    label: label.length > 10 ? label.substring(0, 10) + '...' : label,
    value,
    color: '#3b82f6'
  }));

  // Priority by system (stacked)
  const systemPriorityMap = new Map<string, { critical: number; high: number; medium: number; low: number }>();
  report.incidents.forEach(inc => {
    const systemName = inc.system?.name || 'Unknown';
    const current = systemPriorityMap.get(systemName) || { critical: 0, high: 0, medium: 0, low: 0 };
    if (inc.priority === 'critical') current.critical++;
    else if (inc.priority === 'high') current.high++;
    else if (inc.priority === 'medium') current.medium++;
    else current.low++;
    systemPriorityMap.set(systemName, current);
  });
  const priorityBySystemData = Array.from(systemPriorityMap.entries()).map(([label, data]) => ({
    label,
    ...data
  }));

  // Incidents over time
  const timeMap = new Map<string, number>();
  report.incidents.forEach(inc => {
    const date = new Date(inc.createdAt).toISOString().split('T')[0];
    timeMap.set(date, (timeMap.get(date) || 0) + 1);
  });
  const overTimeData = Array.from(timeMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, value]) => ({ label: label.split('-').slice(1).join('/'), value }));

  // Incidents by reporter
  const reporterMap = new Map<string, number>();
  report.incidents.forEach(inc => {
    const reporterName = inc.reporter?.name || 'Unknown';
    reporterMap.set(reporterName, (reporterMap.get(reporterName) || 0) + 1);
  });
  const byReporterData = Array.from(reporterMap.entries()).map(([label, value]) => ({
    label: label.length > 10 ? label.substring(0, 10) + '...' : label,
    value,
    color: '#8b5cf6'
  }));

  // Resolution time (for resolved/closed incidents)
  const resolvedIncidents = report.incidents.filter(i => i.resolvedAt && (i.status === 'resolved' || i.status === 'closed'));

  return (
    <div className="space-y-6">
      <Card title="Incidents Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{report.incidents.length}</p>
            <p className="text-sm text-blue-700">Total Incidents</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{openCount + inProgressCount}</p>
            <p className="text-sm text-red-700">Active</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{resolvedCount + closedCount}</p>
            <p className="text-sm text-green-700">Resolved/Closed</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-3xl font-bold text-orange-600">{criticalCount + highCount}</p>
            <p className="text-sm text-orange-700">Critical/High</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="By Status">
          <div className="flex justify-center py-4">
            <DonutChart data={statusData} title="Incident Status" size={200} />
          </div>
        </Card>

        <Card title="By Priority">
          <div className="flex justify-center py-4">
            <DonutChart data={priorityData} title="Incident Priority" size={200} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Incidents by System">
          {bySystemData.length > 0 ? (
            <BarChart data={bySystemData} title="Number per system" height={220} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No data</div>
          )}
        </Card>

        <Card title="Incidents by Reporter">
          {byReporterData.length > 0 ? (
            <BarChart data={byReporterData} title="Number per reporter" height={220} />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">No data</div>
          )}
        </Card>
      </div>

      <Card title="Incidents Over Time">
        <LineChart data={overTimeData} title="Incident trend" height={200} color="#ef4444" />
      </Card>

      <Card title="Priority Distribution by System">
        <StackedBarChart data={priorityBySystemData} title="Priority breakdown per system" />
      </Card>

      {resolvedIncidents.length > 0 && (
        <Card title="Resolution Statistics">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{resolvedIncidents.length}</p>
              <p className="text-sm text-green-700">Resolved</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {Math.round(resolvedIncidents.length / report.incidents.length * 100)}%
              </p>
              <p className="text-sm text-blue-700">Resolution Rate</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{report.incidents.length - resolvedIncidents.length}</p>
              <p className="text-sm text-purple-700">Pending Resolution</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportIncidents;
