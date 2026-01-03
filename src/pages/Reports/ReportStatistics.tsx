import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common';
import {
  GaugeChart,
  TrendLineChart,
  ComparisonBarChart,
  RadarChart
} from '../../components/charts';
import type { ReportData } from '../../types';
import ReportDailyLogs from './ReportDailyLogs';
import ReportInspections from './ReportInspections';
import ReportIncidents from './ReportIncidents';
import ReportProducts from './ReportProducts';

interface ReportStatisticsProps {
  report: ReportData;
}

interface CircularChartProps {
  data: { label: string; value: number; color: string }[];
  title: string;
  size?: number;
}

const CircularChart: React.FC<CircularChartProps> = ({ data, title, size = 160 }) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <div
          className="rounded-full bg-gray-100 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="text-gray-400 text-sm">{t('common.noData')}</span>
        </div>
        <p className="text-sm font-medium text-gray-700 mt-3">{title}</p>
      </div>
    );
  }

  // Calculate segments with midpoint for tooltip positioning
  let currentAngle = -90; // Start from top
  const segments = data.map(item => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const midAngle = currentAngle + angle / 2;
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      midAngle
    };
    currentAngle += angle;
    return segment;
  });

  // Create SVG path for each segment
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

  // Calculate tooltip position at segment midpoint
  const getTooltipPosition = (midAngle: number) => {
    const midRad = (midAngle * Math.PI) / 180;
    const tooltipRadius = (radius + innerRadius) / 2;
    return {
      x: radius + tooltipRadius * Math.cos(midRad),
      y: radius + tooltipRadius * Math.sin(midRad)
    };
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="cursor-pointer overflow-visible">
        {segments.map((segment, index) => (
          segment.value > 0 && (
            <path
              key={index}
              d={createArcPath(segment.startAngle, segment.endAngle, radius - 2, innerRadius)}
              fill={segment.color}
              className="transition-opacity hover:opacity-80"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          )
        ))}
        {/* Center text - always shows total */}
        <text
          x={radius}
          y={radius - 8}
          textAnchor="middle"
          style={{ fontSize: '24px', fontWeight: 'bold', fill: '#374151' }}
        >
          {total}
        </text>
        <text
          x={radius}
          y={radius + 12}
          textAnchor="middle"
          style={{ fontSize: '12px', fill: '#9ca3af' }}
        >
          {t('reports.statistics.total')}
        </text>
        {/* Tooltip - detailed content */}
        {hoveredIndex !== null && segments[hoveredIndex] && (() => {
          const segment = segments[hoveredIndex];
          const pos = getTooltipPosition(segment.midAngle);
          const tooltipWidth = 100;
          const tooltipHeight = 58;
          // Adjust position to keep tooltip within view
          let tooltipX = pos.x - tooltipWidth / 2;
          let tooltipY = pos.y - tooltipHeight - 8;
          // Keep within bounds
          if (tooltipX < -10) tooltipX = -10;
          if (tooltipX + tooltipWidth > size + 10) tooltipX = size - tooltipWidth + 10;
          if (tooltipY < -10) tooltipY = pos.y + 15;
          return (
            <g
              onMouseEnter={() => setHoveredIndex(hoveredIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx="6"
                fill="#1f2937"
                style={{ cursor: 'pointer' }}
              />
              {/* Color indicator */}
              <rect
                x={tooltipX + 8}
                y={tooltipY + 10}
                width={10}
                height={10}
                rx="2"
                fill={segment.color}
                style={{ pointerEvents: 'none' }}
              />
              {/* Label */}
              <text
                x={tooltipX + 24}
                y={tooltipY + 18}
                textAnchor="start"
                style={{ fontSize: '11px', fill: 'white', fontWeight: 'bold', pointerEvents: 'none' }}
              >
                {segment.label}
              </text>
              {/* Value */}
              <text
                x={tooltipX + 8}
                y={tooltipY + 34}
                textAnchor="start"
                style={{ fontSize: '10px', fill: '#9ca3af', pointerEvents: 'none' }}
              >
                Count: <tspan fill="white" fontWeight="600">{segment.value}</tspan>
              </text>
              {/* Percentage */}
              <text
                x={tooltipX + 8}
                y={tooltipY + 48}
                textAnchor="start"
                style={{ fontSize: '10px', fill: '#9ca3af', pointerEvents: 'none' }}
              >
                Share: <tspan fill={segment.color} fontWeight="600">{segment.percentage.toFixed(1)}%</tspan>
              </text>
            </g>
          );
        })()}
      </svg>
      <p className="text-sm font-medium text-gray-700 mt-3">{title}</p>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {segments.map((segment, index) => (
          segment.value > 0 && (
            <div
              key={index}
              className="flex items-center gap-1 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-xs text-gray-600">
                {segment.label}: {segment.value} ({segment.percentage.toFixed(0)}%)
              </span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

type TabType = 'overview' | 'dailyLogs' | 'inspections' | 'incidents' | 'products';

const ReportStatistics: React.FC<ReportStatisticsProps> = ({ report }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'overview', label: t('reports.statistics.overview'), count: 0 },
    { id: 'dailyLogs', label: t('reports.statistics.dailyLogs'), count: report.dailyLogs.length },
    { id: 'inspections', label: t('reports.statistics.inspections'), count: report.inspections.length },
    { id: 'incidents', label: t('reports.statistics.incidents'), count: report.incidents.length },
    { id: 'products', label: t('reports.statistics.products'), count: report.products.length }
  ];

  // Calculate daily logs stats
  const totalReadings = report.dailyLogs.reduce((acc, log) => {
    return acc + (log.entries?.length || 0);
  }, 0);

  const outOfRangeCount = report.dailyLogs.reduce((acc, log) => {
    return acc + (log.entries?.filter(e => e.isOutOfRange).length || 0);
  }, 0);

  const dailyLogsChartData = [
    { label: t('reports.statistics.normal'), value: totalReadings - outOfRangeCount, color: '#22c55e' },
    { label: t('reports.statistics.outOfRange'), value: outOfRangeCount, color: '#ef4444' }
  ];

  // Calculate inspection stats
  const completedInspections = report.inspections.filter(i => i.status === 'completed').length;
  const viewedInspections = report.inspections.filter(i => i.status === 'viewed').length;
  const pendingInspections = report.inspections.filter(i => i.status === 'pending').length;

  const inspectionsChartData = [
    { label: t('reports.statistics.viewed'), value: viewedInspections, color: '#22c55e' },
    { label: t('reports.statistics.completed'), value: completedInspections, color: '#3b82f6' },
    { label: t('reports.statistics.pending'), value: pendingInspections, color: '#eab308' }
  ];

  // Calculate incident stats
  const openIncidents = report.incidents.filter(i => i.status === 'open').length;
  const inProgressIncidents = report.incidents.filter(i => i.status === 'in_progress').length;
  const resolvedIncidents = report.incidents.filter(i => i.status === 'resolved').length;
  const closedIncidents = report.incidents.filter(i => i.status === 'closed').length;

  const incidentsStatusChartData = [
    { label: t('reports.statistics.open'), value: openIncidents, color: '#ef4444' },
    { label: t('reports.statistics.inProgress'), value: inProgressIncidents, color: '#eab308' },
    { label: t('reports.statistics.resolved'), value: resolvedIncidents, color: '#22c55e' },
    { label: t('reports.statistics.closed'), value: closedIncidents, color: '#6b7280' }
  ];

  // Incident priority chart
  const criticalIncidents = report.incidents.filter(i => i.priority === 'critical').length;
  const highIncidents = report.incidents.filter(i => i.priority === 'high').length;
  const mediumIncidents = report.incidents.filter(i => i.priority === 'medium').length;
  const lowIncidents = report.incidents.filter(i => i.priority === 'low').length;

  const incidentsPriorityChartData = [
    { label: t('reports.statistics.critical'), value: criticalIncidents, color: '#dc2626' },
    { label: t('reports.statistics.high'), value: highIncidents, color: '#f97316' },
    { label: t('reports.statistics.medium'), value: mediumIncidents, color: '#eab308' },
    { label: t('reports.statistics.low'), value: lowIncidents, color: '#22c55e' }
  ];

  // Calculate product stats
  const lowStockProducts = report.products.filter(p =>
    p.minStockAlert && Number(p.currentStock) <= Number(p.minStockAlert)
  ).length;
  const normalStockProducts = report.products.length - lowStockProducts;

  const productsStockChartData = [
    { label: t('reports.statistics.normalStock'), value: normalStockProducts, color: '#22c55e' },
    { label: t('reports.statistics.lowStock'), value: lowStockProducts, color: '#ef4444' }
  ];

  // Product usage chart
  const stockIn = report.productUsages.filter(u => u.type === 'in').length;
  const stockOut = report.productUsages.filter(u => u.type === 'out').length;

  const productUsageChartData = [
    { label: t('reports.statistics.stockIn'), value: stockIn, color: '#22c55e' },
    { label: t('reports.statistics.stockOut'), value: stockOut, color: '#8b5cf6' }
  ];

  // Prepare trend data for daily logs over time
  const getDailyLogsTrendData = () => {
    const logsByDate: Record<string, number> = {};
    report.dailyLogs.forEach(log => {
      const date = new Date(log.date).toLocaleDateString();
      logsByDate[date] = (logsByDate[date] || 0) + (log.entries?.length || 0);
    });
    return Object.entries(logsByDate)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-10)
      .map(([label, value]) => ({ label, value }));
  };

  // Prepare comparison data for incidents by priority across systems
  const getIncidentComparisonData = () => {
    const systemIncidents: Record<string, Record<string, number>> = {};
    report.incidents.forEach(incident => {
      const systemName = incident.system?.name || t('common.unknown');
      if (!systemIncidents[systemName]) {
        systemIncidents[systemName] = { critical: 0, high: 0, medium: 0, low: 0 };
      }
      systemIncidents[systemName][incident.priority] = (systemIncidents[systemName][incident.priority] || 0) + 1;
    });
    return Object.entries(systemIncidents).slice(0, 5).map(([label, counts]) => ({
      label,
      values: [
        { name: t('reports.statistics.critical'), value: counts.critical, color: '#dc2626' },
        { name: t('reports.statistics.high'), value: counts.high, color: '#f97316' },
        { name: t('reports.statistics.medium'), value: counts.medium, color: '#eab308' },
        { name: t('reports.statistics.low'), value: counts.low, color: '#22c55e' }
      ]
    }));
  };

  // Prepare radar data for system health
  const getSystemHealthRadarData = () => {
    const totalLogs = report.dailyLogs.length;
    const totalInspections = report.inspections.length;
    const totalIncidents = report.incidents.length;
    const resolvedIncidents = report.incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length;
    const completedInspectionsCount = report.inspections.filter(i => i.status === 'completed' || i.status === 'viewed').length;
    const normalReadingsCount = totalReadings - outOfRangeCount;

    return [
      { label: t('reports.statistics.dailyLogs'), value: Math.min(totalLogs, 100), maxValue: 100 },
      { label: t('reports.statistics.inspections'), value: totalInspections > 0 ? Math.round((completedInspectionsCount / totalInspections) * 100) : 0, maxValue: 100 },
      { label: t('reports.statistics.incidents'), value: totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 100, maxValue: 100 },
      { label: t('reports.statistics.readings'), value: totalReadings > 0 ? Math.round((normalReadingsCount / totalReadings) * 100) : 100, maxValue: 100 },
      { label: t('reports.statistics.products'), value: report.products.length > 0 ? Math.round((normalStockProducts / report.products.length) * 100) : 100, maxValue: 100 }
    ];
  };

  const renderOverview = () => (
    <Card title={t('reports.statistics.reportPeriod', { start: report.period.startDate, end: report.period.endDate })}>
      <div className="space-y-8">
        {/* System Health Overview - Radar Chart */}
        <div className="border-b border-gray-200 pb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">{t('reports.statistics.systemHealth')}</h4>
          <div className="flex flex-wrap justify-center gap-8">
            <RadarChart
              data={getSystemHealthRadarData()}
              title={t('reports.statistics.healthScore')}
              size={280}
              color="#3b82f6"
            />
            <div className="flex flex-col justify-center space-y-3">
              <GaugeChart
                value={totalReadings - outOfRangeCount}
                max={totalReadings || 1}
                title={t('reports.statistics.readingsCompliance')}
                size={140}
                thresholds={{ warning: 70, danger: 50 }}
              />
              <GaugeChart
                value={resolvedIncidents + closedIncidents}
                max={report.incidents.length || 1}
                title={t('reports.statistics.incidentResolution')}
                size={140}
                thresholds={{ warning: 60, danger: 40 }}
              />
            </div>
          </div>
        </div>

        {/* Daily Logs Section */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700">{t('reports.statistics.dailyLogs')}</h4>
            <button
              onClick={() => setActiveTab('dailyLogs')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t('reports.statistics.viewDetails')} →
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <CircularChart
              data={dailyLogsChartData}
              title={t('reports.statistics.readingsStatus')}
            />
            <div className="flex-1 min-w-[300px]">
              <TrendLineChart
                data={getDailyLogsTrendData()}
                title={t('reports.statistics.readingsTrend')}
                height={200}
                color="#3b82f6"
                showTrendLine={true}
                showMovingAverage={true}
              />
            </div>
            <div className="flex flex-col justify-center space-y-2">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{report.dailyLogs.length}</p>
                <p className="text-xs text-blue-700">{t('reports.statistics.totalLogs')}</p>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">{totalReadings}</p>
                <p className="text-xs text-indigo-700">{t('reports.statistics.totalReadings')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inspections Section */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700">{t('reports.statistics.inspections')}</h4>
            <button
              onClick={() => setActiveTab('inspections')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t('reports.statistics.viewDetails')} →
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <CircularChart
              data={inspectionsChartData}
              title={t('reports.statistics.inspectionStatus')}
            />
            <div className="flex flex-col justify-center space-y-2">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{report.inspections.length}</p>
                <p className="text-xs text-blue-700">{t('reports.statistics.totalInspections')}</p>
              </div>
              <div className="text-center p-3 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-600">
                  {report.inspections.reduce((acc, i) => acc + (i.items?.length || 0), 0)}
                </p>
                <p className="text-xs text-indigo-700">{t('reports.statistics.itemsChecked')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Incidents Section */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700">{t('reports.statistics.incidents')}</h4>
            <button
              onClick={() => setActiveTab('incidents')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t('reports.statistics.viewDetails')} →
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <CircularChart
              data={incidentsStatusChartData}
              title={t('reports.statistics.incidentsByStatus')}
            />
            <CircularChart
              data={incidentsPriorityChartData}
              title={t('reports.statistics.incidentsByPriority')}
            />
          </div>
          {/* Incidents by System Comparison */}
          {getIncidentComparisonData().length > 0 && (
            <div className="mt-6">
              <ComparisonBarChart
                data={getIncidentComparisonData()}
                title={t('reports.statistics.incidentsBySystem')}
                height={250}
                horizontal={true}
              />
            </div>
          )}
        </div>

        {/* Products Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-700">{t('reports.statistics.products')}</h4>
            <button
              onClick={() => setActiveTab('products')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {t('reports.statistics.viewDetails')} →
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <CircularChart
              data={productsStockChartData}
              title={t('reports.statistics.stockStatus')}
            />
            <CircularChart
              data={productUsageChartData}
              title={t('reports.statistics.usageTransactions')}
            />
            <div className="flex flex-col justify-center space-y-2">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {report.productUsages.filter(u => u.type === 'in').reduce((acc, u) => acc + Number(u.quantity), 0)}
                </p>
                <p className="text-xs text-green-700">{t('reports.statistics.totalQtyIn')}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {report.productUsages.filter(u => u.type === 'out').reduce((acc, u) => acc + Number(u.quantity), 0)}
                </p>
                <p className="text-xs text-purple-700">{t('reports.statistics.totalQtyOut')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Report Info */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {t('reports.statistics.reportType')}: <span className="font-medium capitalize">{report.type}</span>
            {' | '}
            {t('reports.statistics.generated')}: <span className="font-medium">{new Date(report.generatedAt).toLocaleString()}</span>
          </p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'dailyLogs' && <ReportDailyLogs report={report} />}
      {activeTab === 'inspections' && <ReportInspections report={report} />}
      {activeTab === 'incidents' && <ReportIncidents report={report} />}
      {activeTab === 'products' && <ReportProducts report={report} />}
    </div>
  );
};

export default ReportStatistics;
