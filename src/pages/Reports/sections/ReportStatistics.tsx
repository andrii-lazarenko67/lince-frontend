import React from 'react';
import { Card } from '../../../components/common';
import type { ReportData } from '../../../types';

interface ReportStatisticsProps {
  report: ReportData;
}

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  };

  const valueColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    indigo: 'text-indigo-600'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <p className="text-sm font-medium">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${valueColorClasses[color]}`}>{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-75">{subtitle}</p>}
    </div>
  );
};

const ReportStatistics: React.FC<ReportStatisticsProps> = ({ report }) => {
  // Calculate out of range readings
  const outOfRangeCount = report.dailyLogs.reduce((acc, log) => {
    return acc + (log.entries?.filter(e => e.isOutOfRange).length || 0);
  }, 0);

  const totalReadings = report.dailyLogs.reduce((acc, log) => {
    return acc + (log.entries?.length || 0);
  }, 0);

  // Calculate incident stats
  const openIncidents = report.incidents.filter(i => i.status === 'open').length;
  const resolvedIncidents = report.incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;

  // Calculate inspection stats
  const completedInspections = report.inspections.filter(i => i.status === 'completed' || i.status === 'approved').length;
  const pendingInspections = report.inspections.filter(i => i.status === 'pending').length;

  // Calculate product stats
  const lowStockProducts = report.products.filter(p =>
    p.minStockAlert && Number(p.currentStock) <= Number(p.minStockAlert)
  ).length;

  const totalProductUsageIn = report.productUsages
    .filter(u => u.type === 'in')
    .reduce((acc, u) => acc + Number(u.quantity), 0);

  const totalProductUsageOut = report.productUsages
    .filter(u => u.type === 'out')
    .reduce((acc, u) => acc + Number(u.quantity), 0);

  return (
    <Card title={`Report Statistics (${report.period.startDate} to ${report.period.endDate})`}>
      <div className="space-y-6">
        {/* Daily Logs Stats */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Daily Logs</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Logs"
              value={report.dailyLogs.length}
              color="blue"
            />
            <StatCard
              title="Total Readings"
              value={totalReadings}
              color="indigo"
            />
            <StatCard
              title="Out of Range"
              value={outOfRangeCount}
              subtitle={totalReadings > 0 ? `${((outOfRangeCount / totalReadings) * 100).toFixed(1)}% of readings` : undefined}
              color="red"
            />
            <StatCard
              title="Normal Readings"
              value={totalReadings - outOfRangeCount}
              color="green"
            />
          </div>
        </div>

        {/* Inspections Stats */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Inspections</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Inspections"
              value={report.inspections.length}
              color="blue"
            />
            <StatCard
              title="Completed"
              value={completedInspections}
              color="green"
            />
            <StatCard
              title="Pending"
              value={pendingInspections}
              color="yellow"
            />
            <StatCard
              title="Items Checked"
              value={report.inspections.reduce((acc, i) => acc + (i.items?.length || 0), 0)}
              color="indigo"
            />
          </div>
        </div>

        {/* Incidents Stats */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Incidents</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Incidents"
              value={report.incidents.length}
              color="blue"
            />
            <StatCard
              title="Open"
              value={openIncidents}
              color="red"
            />
            <StatCard
              title="Resolved"
              value={resolvedIncidents}
              color="green"
            />
            <StatCard
              title="Critical/High"
              value={report.incidents.filter(i => i.priority === 'critical' || i.priority === 'high').length}
              color="yellow"
            />
          </div>
        </div>

        {/* Products Stats */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Products & Usage</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Active Products"
              value={report.products.length}
              color="blue"
            />
            <StatCard
              title="Low Stock Alert"
              value={lowStockProducts}
              color={lowStockProducts > 0 ? 'red' : 'green'}
            />
            <StatCard
              title="Stock In"
              value={totalProductUsageIn}
              subtitle="Total quantity added"
              color="green"
            />
            <StatCard
              title="Stock Out"
              value={totalProductUsageOut}
              subtitle="Total quantity used"
              color="purple"
            />
          </div>
        </div>

        {/* Report Info */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Report Type: <span className="font-medium capitalize">{report.type}</span>
            {' | '}
            Generated: <span className="font-medium">{new Date(report.generatedAt).toLocaleString()}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ReportStatistics;
