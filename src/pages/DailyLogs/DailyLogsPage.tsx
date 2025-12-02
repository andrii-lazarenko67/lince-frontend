import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchDailyLogs } from '../../store/slices/dailyLogSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, ExportDropdown, ViewModeToggle } from '../../components/common';
import DailyLogsList from "./DailyLogsList"
import DailyLogFilters from "./DailyLogFilters"
import DailyLogsChartView from './DailyLogsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';

const DailyLogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dailyLogs } = useAppSelector((state) => state.dailyLogs);
  const { goToNewDailyLog } = useAppNavigation();

  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [filters, setFilters] = useState({
    systemId: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    dispatch(fetchSystems({}));
    dispatch(fetchDailyLogs({}));
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(fetchDailyLogs({
      systemId: filters.systemId ? Number(filters.systemId) : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }));
  };

  const handleClearFilters = () => {
    setFilters({ systemId: '', startDate: '', endDate: '' });
    dispatch(fetchDailyLogs({}));
  };

  const getExportData = () => {
    const headers = ['Date', 'System', 'User', 'Entries', 'Notes'];
    const rows = dailyLogs.map(log => [
      log.date,
      log.system?.name || '-',
      log.user?.name || '-',
      log.entries?.length || 0,
      log.notes || '-'
    ]);
    return { headers, rows };
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: 'Daily Logs Report',
        subtitle: 'LINCE Water Treatment System',
        filename: `daily-logs-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Records', value: String(dailyLogs.length) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      [{ title: `Daily Logs (${dailyLogs.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: 'Daily Logs Report',
        filename: `daily-logs-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Records', value: String(dailyLogs.length) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      [{ title: `Daily Logs (${dailyLogs.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: 'Daily Logs Report',
        filename: `daily-logs-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Records', value: String(dailyLogs.length) },
          { label: 'Generated', value: new Date().toISOString() }
        ]
      },
      [{ title: 'DAILY LOGS', headers, rows }]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Logs</h1>
          <p className="text-gray-500 mt-1">Record and view daily monitoring data</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <ViewModeToggle
            value={viewMode}
            onChange={setViewMode}
          />
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportHTML={handleExportHTML}
            onExportCSV={handleExportCSV}
            disabled={dailyLogs.length === 0}
          />
          <Button variant="primary" onClick={goToNewDailyLog}>
            New Log
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <DailyLogFilters
            filters={filters}
            onChange={setFilters}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />

          <Card noPadding>
            <DailyLogsList />
          </Card>
        </>
      ) : (
        <DailyLogsChartView dailyLogs={dailyLogs} />
      )}
    </div>
  );
};

export default DailyLogsPage;
