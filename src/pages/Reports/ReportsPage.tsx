import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { generateReport, exportReportPDF, exportReportCSV } from '../../store/slices/reportSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, Input, StatCard } from '../../components/common';

const ReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { currentReport, isGenerating } = useAppSelector((state) => state.reports);

  const [formData, setFormData] = useState({
    type: 'daily',
    systemIds: [] as number[],
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    dispatch(fetchSystems({}));
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSystemChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => Number(option.value));
    setFormData({
      ...formData,
      systemIds: selectedOptions
    });
  };

  const handleGenerate = () => {
    dispatch(generateReport({
      type: formData.type as 'daily' | 'weekly' | 'monthly' | 'custom',
      systemIds: formData.systemIds.length > 0 ? formData.systemIds : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined
    }));
  };

  const handleExportPDF = () => {
    dispatch(exportReportPDF({
      type: formData.type as 'daily' | 'weekly' | 'monthly' | 'custom',
      systemIds: formData.systemIds.length > 0 ? formData.systemIds : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined
    }));
  };

  const handleExportCSV = () => {
    dispatch(exportReportCSV({
      type: formData.type as 'daily' | 'weekly' | 'monthly' | 'custom',
      systemIds: formData.systemIds.length > 0 ? formData.systemIds : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined
    }));
  };

  const typeOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Generate and export monitoring reports</p>
      </div>

      <Card title="Report Configuration">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={typeOptions}
            label="Report Type"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Systems</label>
            <select
              multiple
              name="systemIds"
              value={formData.systemIds.map(String)}
              onChange={handleSystemChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ minHeight: '80px' }}
            >
              {systems.map(system => (
                <option key={system.id} value={system.id}>{system.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>

          {formData.type === 'custom' && (
            <>
              <Input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                label="Start Date"
              />

              <Input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                label="End Date"
              />
            </>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <Button variant="primary" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>
          {currentReport && (
            <>
              <Button variant="outline" onClick={handleExportPDF}>
                Export PDF
              </Button>
              <Button variant="outline" onClick={handleExportCSV}>
                Export CSV
              </Button>
            </>
          )}
        </div>
      </Card>

      {currentReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Readings"
              value={currentReport.summary.totalReadings}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            />
            <StatCard
              title="Out of Range"
              value={currentReport.summary.outOfRangeCount}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
            <StatCard
              title="Inspections"
              value={currentReport.summary.inspectionsCount}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
            />
            <StatCard
              title="Incidents"
              value={currentReport.summary.incidentsCount}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
          </div>

          <Card title="Report Details">
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Period: {currentReport.period.startDate} to {currentReport.period.endDate}
              </p>
              <p className="text-sm text-gray-500">
                Generated: {new Date(currentReport.generatedAt).toLocaleString()}
              </p>
            </div>

            {currentReport.systems.map(system => (
              <div key={system.id} className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">{system.name}</h4>
                <pre className="text-sm text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
                  {JSON.stringify(system.data, null, 2)}
                </pre>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
