import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchDailyLogs } from '../../store/slices/dailyLogSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, ExportDropdown, ViewModeToggle } from '../../components/common';
import DailyLogsList from "./DailyLogsList"
import DailyLogFilters from "./DailyLogFilters"
import DailyLogsChartView from './DailyLogsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';

const DailyLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { dailyLogs } = useAppSelector((state) => state.dailyLogs);
  const { goToNewDailyLog } = useAppNavigation();

  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [filters, setFilters] = useState({
    systemId: '',
    stageId: '',
    recordType: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    dispatch(fetchSystems({ parentId: 'null' }));
    dispatch(fetchDailyLogs({}));
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(fetchDailyLogs({
      systemId: filters.systemId ? Number(filters.systemId) : undefined,
      stageId: filters.stageId ? Number(filters.stageId) : undefined,
      recordType: filters.recordType ? (filters.recordType as 'field' | 'laboratory') : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }));
  };

  const handleClearFilters = () => {
    setFilters({ systemId: '', stageId: '', recordType: '', startDate: '', endDate: '' });
    dispatch(fetchDailyLogs({}));
  };

  const getExportData = () => {
    const headers = [t('dailyLogs.export.type'), t('dailyLogs.export.date'), t('dailyLogs.export.system'), t('dailyLogs.export.stage'), t('dailyLogs.export.period'), t('dailyLogs.export.laboratory'), t('dailyLogs.export.user'), t('dailyLogs.export.entries'), t('dailyLogs.export.notes')];
    const rows = dailyLogs.map(log => [
      log.recordType === 'field' ? t('dailyLogs.recordType.field') : t('dailyLogs.recordType.laboratory'),
      new Date(log.date).toLocaleDateString(),
      log.system?.name || '-',
      log.stage?.name || '-',
      log.period || '-',
      log.recordType === 'laboratory' ? (log.laboratory || '-') : '-',
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
        title: t('dailyLogs.export.title'),
        subtitle: t('dailyLogs.export.subtitle'),
        filename: `daily-logs-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('dailyLogs.export.totalRecords'), value: String(dailyLogs.length) },
          { label: t('dailyLogs.export.generated'), value: new Date().toLocaleString() }
        ]
      },
      [{ title: `${t('dailyLogs.export.dailyLogs')} (${dailyLogs.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: t('dailyLogs.export.title'),
        filename: `daily-logs-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('dailyLogs.export.totalRecords'), value: String(dailyLogs.length) },
          { label: t('dailyLogs.export.generated'), value: new Date().toLocaleString() }
        ]
      },
      [{ title: `${t('dailyLogs.export.dailyLogs')} (${dailyLogs.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: t('dailyLogs.export.title'),
        filename: `daily-logs-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('dailyLogs.export.totalRecords'), value: String(dailyLogs.length) },
          { label: t('dailyLogs.export.generated'), value: new Date().toISOString() }
        ]
      },
      [{ title: t('dailyLogs.export.dailyLogsUpper'), headers, rows }]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dailyLogs.title')}</h1>
          <p className="text-gray-500 mt-1">{t('dailyLogs.description')}</p>
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
            {t('dailyLogs.newLog')}
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
