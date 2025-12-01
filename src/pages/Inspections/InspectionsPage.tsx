import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchInspections } from '../../store/slices/inspectionSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, Input } from '../../components/common';
import InspectionsList from "./InspectionsList"
import InspectionsChartView from './InspectionsChartView';

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
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Table
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'chart'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Charts
            </button>
          </div>
          <Button variant="primary" onClick={goToNewInspection}>
            New Inspection
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <Select
                name="systemId"
                value={filters.systemId}
                onChange={(e) => setFilters({ ...filters, systemId: e.target.value })}
                options={systemOptions}
                label="System"
                placeholder="All Systems"
              />

              <Select
                name="status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                options={statusOptions}
                label="Status"
                placeholder="All Statuses"
              />

              <Input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                label="Start Date"
              />

              <Input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                label="End Date"
              />

              <div className="flex space-x-2">
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
