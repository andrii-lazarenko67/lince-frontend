import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation, usePagination } from '../../hooks';
import { fetchDailyLogs } from '../../store/slices/dailyLogSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, ExportDropdown, ViewModeToggle, PaginatedTable, Badge } from '../../components/common';
import DailyLogFilters from "./DailyLogFilters"
import DailyLogsChartView from './DailyLogsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import type { DailyLog } from '../../types';
import { useTour, useAutoStartTour, DAILY_LOGS_LIST_TOUR } from '../../tours';
import { HelpOutline } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

const DailyLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedClientId } = useAppSelector((state) => state.clients);
  const { dailyLogs, pagination, loading } = useAppSelector((state) => state.dailyLogs);
  const { goToNewDailyLog, goToDailyLogDetail } = useAppNavigation();

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(DAILY_LOGS_LIST_TOUR);

  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [filters, setFilters] = useState({
    systemId: '',
    stageId: '',
    recordType: '',
    startDate: '',
    endDate: ''
  });

  // Use the pagination hook
  const {
    page,
    rowsPerPage,
    apiPage,
    apiLimit,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage
  } = usePagination();

  // Load daily logs with current pagination and filters
  const loadDailyLogs = useCallback(() => {
    dispatch(fetchDailyLogs({
      page: apiPage,
      limit: apiLimit,
      systemId: filters.systemId ? Number(filters.systemId) : undefined,
      stageId: filters.stageId ? Number(filters.stageId) : undefined,
      recordType: filters.recordType ? (filters.recordType as 'field' | 'laboratory') : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }));
  }, [dispatch, apiPage, apiLimit, filters]);

  // Initial load and when pagination/filters change
  useEffect(() => {
    loadDailyLogs();
  }, [loadDailyLogs]);

  // Load systems once
  useEffect(() => {
    dispatch(fetchSystems({ parentId: 'null' }));
  }, [dispatch, selectedClientId]);

  const handleApplyFilters = () => {
    resetPage();
  };

  const handleClearFilters = () => {
    setFilters({ systemId: '', stageId: '', recordType: '', startDate: '', endDate: '' });
    resetPage();
  };

  const getExportData = () => {
    const headers = [t('dailyLogs.export.type'), t('dailyLogs.export.date'), t('dailyLogs.export.system'), t('dailyLogs.export.stage'), t('dailyLogs.export.period'), t('dailyLogs.export.laboratory'), t('dailyLogs.export.user'), t('dailyLogs.export.entries'), t('dailyLogs.export.notes')];
    const rows = dailyLogs.map(log => [
      log.recordType === 'field' ? t('dailyLogs.recordType.field') : t('dailyLogs.recordType.laboratory'),
      new Date(log.date).toLocaleDateString(),
      log.system?.name || '-',
      log.stage?.name || '-',
      log.period ? t(`dailyLogs.period.${log.period}`) : '-',
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
        ],
        footerText: `${t('common.exportFooter')} - ${new Date().toLocaleString()}`
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

  const columns = [
    {
      key: 'recordType',
      header: t('dailyLogs.list.type'),
      render: (log: DailyLog) => (
        <Badge variant={log.recordType === 'field' ? 'primary' : 'info'}>
          {log.recordType === 'field' ? t('dailyLogs.list.field') : t('dailyLogs.list.lab')}
        </Badge>
      )
    },
    {
      key: 'date',
      header: t('dailyLogs.list.date'),
      render: (log: DailyLog) => (
        <span className="font-medium text-gray-900">
          {new Date(log.date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'system',
      header: t('dailyLogs.list.system'),
      render: (log: DailyLog) => (
        <div>
          <div>{log.system?.name || '-'}</div>
          {log.stage && (
            <div className="text-xs text-gray-500">{t('dailyLogs.list.stage')}: {log.stage.name}</div>
          )}
        </div>
      )
    },
    {
      key: 'period',
      header: t('dailyLogs.list.period'),
      render: (log: DailyLog) => log.period ? t(`dailyLogs.period.${log.period}`, { defaultValue: log.period }) : '-'
    },
    {
      key: 'laboratory',
      header: t('dailyLogs.list.laboratory'),
      render: (log: DailyLog) => log.recordType === 'laboratory' ? (log.laboratory || '-') : '-'
    },
    {
      key: 'user',
      header: t('dailyLogs.list.recordedBy'),
      render: (log: DailyLog) => log.user?.name || '-'
    },
    {
      key: 'entries',
      header: t('dailyLogs.list.entries'),
      render: (log: DailyLog) => {
        const outOfRange = log.entries?.filter(e => e.isOutOfRange).length || 0;
        return (
          <div className="flex items-center space-x-2">
            <span>{log.entries?.length || 0}</span>
            {outOfRange > 0 && (
              <Badge variant="danger">{t('dailyLogs.list.alert', { count: outOfRange })}</Badge>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-tour="dailylogs-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dailyLogs.title')}</h1>
          <p className="text-gray-500 mt-1">{t('dailyLogs.description')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div data-tour="view-mode">
            <ViewModeToggle
              value={viewMode}
              onChange={setViewMode}
            />
          </div>
          <div data-tour="export-button">
            <ExportDropdown
              onExportPDF={handleExportPDF}
              onExportHTML={handleExportHTML}
              onExportCSV={handleExportCSV}
              disabled={dailyLogs.length === 0}
            />
          </div>
          <div data-tour="new-log-button">
            <Button variant="primary" onClick={goToNewDailyLog}>
              {t('dailyLogs.newLog')}
            </Button>
          </div>
          <Tooltip title={isCompleted(DAILY_LOGS_LIST_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
            <IconButton
              onClick={() => startTour(DAILY_LOGS_LIST_TOUR)}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'primary.dark'
                }
              }}
            >
              <HelpOutline />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <div data-tour="filters">
            <DailyLogFilters
              filters={filters}
              onChange={setFilters}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
          </div>

          <div data-tour="dailylogs-table">
            <Card noPadding>
              <PaginatedTable
                columns={columns}
                data={dailyLogs}
                keyExtractor={(log: DailyLog) => log.id}
                onRowClick={(log: DailyLog) => goToDailyLogDetail(log.id)}
                emptyMessage={t('dailyLogs.list.emptyMessage')}
                loading={loading}
                pagination={pagination}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Card>
          </div>
        </>
      ) : (
        <DailyLogsChartView dailyLogs={dailyLogs} />
      )}
    </div>
  );
};

export default DailyLogsPage;
