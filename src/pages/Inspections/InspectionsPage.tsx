import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation, usePagination } from '../../hooks';
import { fetchInspections } from '../../store/slices/inspectionSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, DateInput, ExportDropdown, ViewModeToggle, PaginatedTable, Badge } from '../../components/common';
import InspectionsChartView from './InspectionsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import type { Inspection } from '../../types';
import { useTour, useAutoStartTour, INSPECTIONS_LIST_TOUR } from '../../tours';
import { HelpOutline } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

const InspectionsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedClientId } = useAppSelector((state) => state.clients);
  const { systems } = useAppSelector((state) => state.systems);
  const { inspections, pagination, loading } = useAppSelector((state) => state.inspections);
  const { goToNewInspection, goToInspectionDetail } = useAppNavigation();

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(INSPECTIONS_LIST_TOUR);

  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [filters, setFilters] = useState({
    systemId: '',
    stageId: '',
    status: '',
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

  // Load inspections with current pagination and filters
  const loadInspections = useCallback(() => {
    dispatch(fetchInspections({
      page: apiPage,
      limit: apiLimit,
      systemId: filters.systemId ? Number(filters.systemId) : undefined,
      stageId: filters.stageId ? Number(filters.stageId) : undefined,
      status: filters.status || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }));
  }, [dispatch, apiPage, apiLimit, filters]);

  // Initial load and when pagination/filters change
  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  // Load systems once
  useEffect(() => {
    dispatch(fetchSystems({ parentId: 'null' }));
  }, [dispatch, selectedClientId]);

  const handleApplyFilters = () => {
    resetPage();
  };

  const handleClearFilters = () => {
    setFilters({ systemId: '', stageId: '', status: '', startDate: '', endDate: '' });
    resetPage();
  };

  const getExportData = () => {
    const headers = [t('inspections.export.date'), t('inspections.export.system'), t('inspections.export.inspector'), t('inspections.export.status'), t('inspections.export.conclusion'), t('inspections.export.items')];
    const rows = inspections.map(insp => [
      new Date(insp.date).toLocaleDateString(),
      insp.system?.name || '-',
      insp.user?.name || '-',
      t(`inspections.status.${insp.status}`),
      insp.conclusion || '-',
      insp.items?.length || 0
    ]);
    return { headers, rows };
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: t('inspections.export.title'),
        subtitle: t('inspections.export.subtitle'),
        filename: `inspections-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('inspections.export.totalInspections'), value: String(inspections.length) },
          { label: t('inspections.export.generated'), value: new Date().toLocaleString() }
        ],
        footerText: `${t('common.exportFooter')} - ${new Date().toLocaleString()}`
      },
      [{ title: `${t('inspections.export.inspections')} (${inspections.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: t('inspections.export.title'),
        filename: `inspections-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('inspections.export.totalInspections'), value: String(inspections.length) },
          { label: t('inspections.export.generated'), value: new Date().toLocaleString() }
        ]
      },
      [{ title: `${t('inspections.export.inspections')} (${inspections.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: t('inspections.export.title'),
        filename: `inspections-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('inspections.export.totalInspections'), value: String(inspections.length) },
          { label: t('inspections.export.generated'), value: new Date().toISOString() }
        ]
      },
      [{ title: t('inspections.export.inspectionsUpper'), headers, rows }]
    );
  };

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));

  // Get stages (children) from the selected system's children array in Redux
  const selectedSystem = systems.find(s => s.id === Number(filters.systemId));
  const stageOptions = selectedSystem?.children?.map(stage => ({
    value: stage.id,
    label: stage.name
  })) || [];

  const statusOptions = [
    { value: 'pending', label: t('inspections.filters.pending') },
    // { value: 'completed', label: t('inspections.filters.completed') },
    { value: 'viewed', label: t('inspections.filters.viewed') }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">{t('inspections.status.pending')}</Badge>;
      case 'viewed':
        return <Badge variant="success">{t('inspections.status.viewed')}</Badge>;
      case 'completed':
        return <Badge variant="danger">{t('inspections.status.completed')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'date',
      header: t('inspections.list.date'),
      render: (inspection: Inspection) => (
        <span className="font-medium text-gray-900">
          {new Date(inspection.date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'system',
      header: t('inspections.list.system'),
      render: (inspection: Inspection) => inspection.system?.name || '-'
    },
    {
      key: 'stage',
      header: t('inspections.list.stage'),
      render: (inspection: Inspection) => inspection.stage?.name || '-'
    },
    {
      key: 'user',
      header: t('inspections.list.inspector'),
      render: (inspection: Inspection) => inspection.user?.name || '-'
    },
    {
      key: 'status',
      header: t('inspections.list.status'),
      render: (inspection: Inspection) => getStatusBadge(inspection.status)
    },
    {
      key: 'items',
      header: t('inspections.list.items'),
      render: (inspection: Inspection) => {
        const total = inspection.items?.length || 0;
        const conforme = inspection.items?.filter(i => i.status === 'C').length || 0;
        const noConforme = inspection.items?.filter(i => i.status === 'NC').length || 0;
        return (
          <div className="flex items-center space-x-2">
            <span>{conforme}/{total} {t('inspections.list.conforme')}</span>
            {noConforme > 0 && (
              <Badge variant="danger">{noConforme} {t('inspections.list.nc')}</Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      header: t('inspections.list.created'),
      render: (inspection: Inspection) => new Date(inspection.createdAt).toLocaleString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4" data-tour="inspections-header">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inspections.title')}</h1>
          <p className="text-gray-500 mt-1">{t('inspections.description')}</p>
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
              disabled={inspections.length === 0}
            />
          </div>
          <div data-tour="new-inspection-button">
            <Button variant="primary" onClick={goToNewInspection}>
              {t('inspections.newInspection')}
            </Button>
          </div>
          <Tooltip title={isCompleted(INSPECTIONS_LIST_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
            <IconButton
              onClick={() => startTour(INSPECTIONS_LIST_TOUR)}
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
          <div className="bg-white rounded-lg shadow p-4" data-tour="filters">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Select
                  name="systemId"
                  value={filters.systemId}
                  onChange={(e) => setFilters({ ...filters, systemId: e.target.value, stageId: '' })}
                  options={systemOptions}
                  label={t('inspections.filters.system')}
                  placeholder={t('inspections.filters.allSystems')}
                />
              </div>

              {stageOptions.length > 0 && (
                <div>
                  <Select
                    name="stageId"
                    value={filters.stageId}
                    onChange={(e) => setFilters({ ...filters, stageId: e.target.value })}
                    options={stageOptions}
                    label={t('inspections.filters.stage')}
                    placeholder={t('inspections.filters.allStages')}
                  />
                </div>
              )}

              <div>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  options={statusOptions}
                  label={t('inspections.filters.status')}
                  placeholder={t('inspections.filters.allStatuses')}
                />
              </div>

              <div>
                <DateInput
                  name="startDate"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  label={t('inspections.filters.startDate')}
                />
              </div>

              <div>
                <DateInput
                  name="endDate"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  label={t('inspections.filters.endDate')}
                />
              </div>

              <div className="flex space-x-2 items-end">
                <Button variant="primary" onClick={handleApplyFilters} className="flex-1">
                  {t('inspections.filters.apply')}
                </Button>
                <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                  {t('inspections.filters.clear')}
                </Button>
              </div>
            </div>
          </div>

          <div data-tour="inspections-table">
            <Card noPadding>
              <PaginatedTable
                columns={columns}
                data={inspections}
                keyExtractor={(inspection: Inspection) => inspection.id}
                onRowClick={(inspection: Inspection) => goToInspectionDetail(inspection.id)}
                emptyMessage={t('inspections.list.emptyMessage')}
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
        <InspectionsChartView inspections={inspections} />
      )}
    </div>
  );
};

export default InspectionsPage;
