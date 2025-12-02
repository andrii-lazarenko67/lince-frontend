import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, ExportDropdown, ViewModeToggle } from '../../components/common';
import SystemsList from "./SystemsList";
import SystemForm from "./SystemForm";
import SystemsChartView from './SystemsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';

const SystemsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSystems({}));
  }, [dispatch]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'maintenance': return 'Maintenance';
      default: return status;
    }
  };

  const getExportData = () => {
    const headers = ['Name', 'Location', 'Type', 'Status', 'Created'];
    const rows = systems.map(sys => [
      sys.name,
      sys.location || '-',
      sys.type || '-',
      getStatusLabel(sys.status),
      new Date(sys.createdAt).toLocaleDateString()
    ]);
    return { headers, rows };
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: 'Systems Report',
        subtitle: 'LINCE Water Treatment System',
        filename: `systems-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Systems', value: String(systems.length) },
          { label: 'Active Systems', value: String(systems.filter(s => s.status === 'active').length) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      [{ title: `Systems (${systems.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: 'Systems Report',
        filename: `systems-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Systems', value: String(systems.length) },
          { label: 'Active Systems', value: String(systems.filter(s => s.status === 'active').length) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      [{ title: `Systems (${systems.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: 'Systems Report',
        filename: `systems-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Systems', value: String(systems.length) },
          { label: 'Active Systems', value: String(systems.filter(s => s.status === 'active').length) },
          { label: 'Generated', value: new Date().toISOString() }
        ]
      },
      [{ title: 'SYSTEMS', headers, rows }]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Systems</h1>
          <p className="text-gray-500 mt-1">Manage your water treatment systems</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewModeToggle
            value={viewMode}
            onChange={setViewMode}
          />
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportHTML={handleExportHTML}
            onExportCSV={handleExportCSV}
            disabled={systems.length === 0}
          />
          <Button variant="primary" onClick={() => setIsFormOpen(true)}>
            Add System
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card noPadding>
          <SystemsList />
        </Card>
      ) : (
        <SystemsChartView systems={systems} />
      )}

      <SystemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default SystemsPage;
