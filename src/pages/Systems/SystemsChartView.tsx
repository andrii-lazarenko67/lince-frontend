import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common';
import { DonutChart, BarChart } from '../../components/charts';
import type { System } from '../../types';

interface SystemsChartViewProps {
  systems: System[];
}

const SystemsChartView: React.FC<SystemsChartViewProps> = ({ systems }) => {
  const { t } = useTranslation();
  const totalSystems = systems.length;

  // Status counts
  const activeCount = systems.filter(s => s.status === 'active').length;
  const inactiveCount = systems.filter(s => s.status === 'inactive').length;
  const maintenanceCount = systems.filter(s => s.status === 'maintenance').length;

  // Count monitoring points and checklist items
  let totalMonitoringPoints = 0;
  let totalChecklistItems = 0;
  systems.forEach(s => {
    totalMonitoringPoints += s.monitoringPoints?.length || 0;
    totalChecklistItems += s.checklistItems?.length || 0;
  });

  // Status donut
  const statusData = [
    { label: t('systems.active'), value: activeCount, color: '#22c55e' },
    { label: t('systems.inactive'), value: inactiveCount, color: '#6b7280' },
    { label: t('systems.maintenance'), value: maintenanceCount, color: '#f59e0b' }
  ];

  // Systems by type
  const typeMap = new Map<string, number>();
  systems.forEach(s => {
    const type = s.systemType?.name || t('products.other');
    typeMap.set(type, (typeMap.get(type) || 0) + 1);
  });
  const typeColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];
  const byTypeData = Array.from(typeMap.entries()).map(([label, value], index) => ({
    label,
    value,
    color: typeColors[index % typeColors.length]
  }));

  // Systems by location
  const locationMap = new Map<string, number>();
  systems.forEach(s => {
    const location = s.location || t('common.noData');
    locationMap.set(location, (locationMap.get(location) || 0) + 1);
  });
  const byLocationData = Array.from(locationMap.entries())
    .map(([label, value]) => ({
      label: label.length > 12 ? label.substring(0, 12) + '...' : label,
      value,
      color: '#3b82f6'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Monitoring points per system
  const monitoringPointsData = systems
    .map(s => ({
      label: s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name,
      value: s.monitoringPoints?.length || 0,
      color: '#8b5cf6'
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Checklist items per system
  const checklistItemsData = systems
    .map(s => ({
      label: s.name.length > 12 ? s.name.substring(0, 12) + '...' : s.name,
      value: s.checklistItems?.length || 0,
      color: '#10b981'
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <Card title={t('dashboard.overview')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalSystems}</p>
            <p className="text-sm text-blue-700">{t('systems.title')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-green-700">{t('systems.active')}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{totalMonitoringPoints}</p>
            <p className="text-sm text-purple-700">{t('systems.monitoringPoints')}</p>
          </div>
          <div className="text-center p-4 bg-teal-50 rounded-lg">
            <p className="text-3xl font-bold text-teal-600">{totalChecklistItems}</p>
            <p className="text-sm text-teal-700">{t('systems.checklistItems')}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('common.status')}>
          <div className="flex justify-center py-4">
            <DonutChart data={statusData} title={t('systems.systemStatus')} size={200} />
          </div>
        </Card>

        <Card title={t('systems.systemType')}>
          <div className="flex justify-center py-4">
            <DonutChart data={byTypeData} title={t('common.type')} size={200} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('common.location')}>
          <BarChart data={byLocationData} title={t('systems.title')} height={220} />
        </Card>

        {monitoringPointsData.length > 0 && (
          <Card title={t('systems.monitoringPoints')}>
            <BarChart data={monitoringPointsData} title={t('systems.monitoringPoints')} height={220} defaultColor="#8b5cf6" />
          </Card>
        )}
      </div>

      {checklistItemsData.length > 0 && (
        <Card title={t('systems.checklistItems')}>
          <BarChart data={checklistItemsData} title={t('systems.checklistItems')} height={220} defaultColor="#10b981" />
        </Card>
      )}
    </div>
  );
};

export default SystemsChartView;
