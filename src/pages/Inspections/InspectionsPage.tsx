import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchInspections } from '../../store/slices/inspectionSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, DateInput, ExportDropdown, ViewModeToggle } from '../../components/common';
import InspectionsList from "./InspectionsList"
import InspectionsChartView from './InspectionsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';

const InspectionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { inspections } = useAppSelector((state) => state.inspections);
  const { goToNewInspection } = useAppNavigation();

  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [filters, setFilters] = useState({
    systemId: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    dispatch(fetchSystems({}));
    dispatch(fetchInspections({}));
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(fetchInspections({
      systemId: filters.systemId ? Number(filters.systemId) : undefined,
      status: filters.status || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }));
  };

  const handleClearFilters = () => {
    setFilters({ systemId: '', status: '', startDate: '', endDate: '' });
    dispatch(fetchInspections({}));
  };

  const getExportData = () => {
    const headers = ['Date', 'System', 'Inspector', 'Status', 'Conclusion', 'Items'];
    const rows = inspections.map(insp => [
      new Date(insp.date).toLocaleDateString(),
      insp.system?.name || '-',
      insp.user?.name || '-',
      insp.status,
      insp.conclusion || '-',
      insp.items?.length || 0
    ]);
    return { headers, rows };
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: 'Inspections Report',
        subtitle: 'LINCE Water Treatment System',
        filename: `inspections-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Inspections', value: String(inspections.length) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      [{ title: `Inspections (${inspections.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: 'Inspections Report',
        filename: `inspections-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Inspections', value: String(inspections.length) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      [{ title: `Inspections (${inspections.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: 'Inspections Report',
        filename: `inspections-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Inspections', value: String(inspections.length) },
          { label: 'Generated', value: new Date().toISOString() }
        ]
      },
      [{ title: 'INSPECTIONS', headers, rows }]
    );
  };

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
          <p className="text-gray-500 mt-1">Manage system inspections</p>
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
            disabled={inspections.length === 0}
          />
          <Button variant="primary" onClick={goToNewInspection}>
            New Inspection
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Select
                  name="systemId"
                  value={filters.systemId}
                  onChange={(e) => setFilters({ ...filters, systemId: e.target.value })}
                  options={systemOptions}
                  label="System"
                  placeholder="All Systems"
                />
              </div>

              <div>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  options={statusOptions}
                  label="Status"
                  placeholder="All Statuses"
                />
              </div>

              <div>
                <DateInput
                  name="startDate"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  label="Start Date"
                />
              </div>

              <div>
                <DateInput
                  name="endDate"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  label="End Date"
                />
              </div>

              <div className="flex space-x-2 items-start">
                <Button variant="primary" onClick={handleApplyFilters}>
                  Apply
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <Card noPadding>
            <InspectionsList />
          </Card>
        </>
      ) : (
        <InspectionsChartView inspections={inspections} />
      )}
    </div>
  );
};

export default InspectionsPage;
