import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchIncidents } from '../../store/slices/incidentSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, DateInput, Table, Badge, ExportDropdown, ViewModeToggle } from '../../components/common';
import IncidentsChartView from './IncidentsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import type { Incident } from '../../types';

const IncidentsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { incidents } = useAppSelector((state) => state.incidents);
  const { goToNewIncident, goToIncidentDetail } = useAppNavigation();

  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [filters, setFilters] = useState({
    systemId: '',
    stageId: '',
    status: '',
    priority: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    dispatch(fetchSystems({ parentId: 'null' }));
    dispatch(fetchIncidents({}));
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(fetchIncidents({
      systemId: filters.systemId ? Number(filters.systemId) : undefined,
      stageId: filters.stageId ? Number(filters.stageId) : undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }));
  };

  const handleClearFilters = () => {
    setFilters({ systemId: '', stageId: '', status: '', priority: '', startDate: '', endDate: '' });
    dispatch(fetchIncidents({}));
  };

  const getExportData = () => {
    const headers = [
      t('incidents.page.exportHeaders.title'),
      t('incidents.page.exportHeaders.system'),
      t('incidents.page.exportHeaders.priority'),
      t('incidents.page.exportHeaders.status'),
      t('incidents.page.exportHeaders.reporter'),
      t('incidents.page.exportHeaders.assignee'),
      t('incidents.page.exportHeaders.created')
    ];
    const rows = incidents.map(inc => [
      inc.title,
      inc.system?.name || '-',
      inc.priority,
      inc.status,
      inc.reporter?.name || '-',
      inc.assignee?.name || '-',
      new Date(inc.createdAt).toLocaleDateString()
    ]);
    return { headers, rows };
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: t('incidents.page.exportTitle'),
        subtitle: t('incidents.page.exportSubtitle'),
        filename: `incidents-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('incidents.page.exportMetadata.total'), value: String(incidents.length) },
          { label: t('incidents.page.exportMetadata.generated'), value: new Date().toLocaleString() }
        ]
      },
      [{ title: t('incidents.page.exportSectionTitle', { count: incidents.length }), headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: t('incidents.page.exportTitle'),
        filename: `incidents-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('incidents.page.exportMetadata.total'), value: String(incidents.length) },
          { label: t('incidents.page.exportMetadata.generated'), value: new Date().toLocaleString() }
        ]
      },
      [{ title: t('incidents.page.exportSectionTitle', { count: incidents.length }), headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: t('incidents.page.exportTitle'),
        filename: `incidents-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('incidents.page.exportMetadata.total'), value: String(incidents.length) },
          { label: t('incidents.page.exportMetadata.generated'), value: new Date().toISOString() }
        ]
      },
      [{ title: t('incidents.page.exportCSVTitle'), headers, rows }]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="danger">{t('incidents.page.statusOpen')}</Badge>;
      case 'in_progress':
        return <Badge variant="warning">{t('incidents.page.statusInProgress')}</Badge>;
      case 'resolved':
        return <Badge variant="success">{t('incidents.page.statusResolved')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="danger">{t('incidents.page.priorityCritical')}</Badge>;
      case 'high':
        return <Badge variant="warning">{t('incidents.page.priorityHigh')}</Badge>;
      case 'medium':
        return <Badge variant="info">{t('incidents.page.priorityMedium')}</Badge>;
      case 'low':
        return <Badge variant="secondary">{t('incidents.page.priorityLow')}</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const columns = [
    {
      key: 'title',
      header: t('incidents.page.columnTitle'),
      render: (incident: Incident) => (
        <span className="font-medium text-gray-900">{incident.title}</span>
      )
    },
    {
      key: 'system',
      header: t('incidents.page.columnSystem'),
      render: (incident: Incident) => incident.system?.name || '-'
    },
    {
      key: 'priority',
      header: t('incidents.page.columnPriority'),
      render: (incident: Incident) => getPriorityBadge(incident.priority)
    },
    {
      key: 'status',
      header: t('incidents.page.columnStatus'),
      render: (incident: Incident) => getStatusBadge(incident.status)
    },
    {
      key: 'reporter',
      header: t('incidents.page.columnReporter'),
      render: (incident: Incident) => incident.reporter?.name || '-'
    },
    {
      key: 'createdAt',
      header: t('incidents.page.columnCreated'),
      render: (incident: Incident) => new Date(incident.createdAt).toLocaleString()
    }
  ];

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));

  // Get stages (children) from the selected system's children array in Redux
  const selectedSystem = systems.find(s => s.id === Number(filters.systemId));
  const stageOptions = selectedSystem?.children?.map(stage => ({
    value: stage.id,
    label: stage.name
  })) || [];

  const statusOptions = [
    { value: 'open', label: t('incidents.page.statusOpen') },
    { value: 'in_progress', label: t('incidents.page.statusInProgress') },
    { value: 'resolved', label: t('incidents.page.statusResolved') }
  ];
  const priorityOptions = [
    { value: 'critical', label: t('incidents.page.priorityCritical') },
    { value: 'high', label: t('incidents.page.priorityHigh') },
    { value: 'medium', label: t('incidents.page.priorityMedium') },
    { value: 'low', label: t('incidents.page.priorityLow') }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('incidents.page.title')}</h1>
          <p className="text-gray-500 mt-1">{t('incidents.page.subtitle')}</p>
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
            disabled={incidents.length === 0}
          />
          <Button variant="primary" onClick={goToNewIncident}>
            {t('incidents.page.reportButton')}
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div>
                <Select
                  name="systemId"
                  value={filters.systemId}
                  onChange={(e) => setFilters({ ...filters, systemId: e.target.value, stageId: '' })}
                  options={systemOptions}
                  label={t('incidents.page.filterSystem')}
                  placeholder={t('incidents.page.filterSystemPlaceholder')}
                />
              </div>

              {stageOptions.length > 0 && (
                <div>
                  <Select
                    name="stageId"
                    value={filters.stageId}
                    onChange={(e) => setFilters({ ...filters, stageId: e.target.value })}
                    options={stageOptions}
                    label={t('incidents.page.filterStage')}
                    placeholder={t('incidents.page.filterStagePlaceholder')}
                  />
                </div>
              )}

              <div>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  options={statusOptions}
                  label={t('incidents.page.filterStatus')}
                  placeholder={t('incidents.page.filterStatusPlaceholder')}
                />
              </div>

              <div>
                <Select
                  name="priority"
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  options={priorityOptions}
                  label={t('incidents.page.filterPriority')}
                  placeholder={t('incidents.page.filterPriorityPlaceholder')}
                />
              </div>

              <div>
                <DateInput
                  name="startDate"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  label={t('incidents.page.filterStartDate')}
                />
              </div>

              <div>
                <DateInput
                  name="endDate"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  label={t('incidents.page.filterEndDate')}
                />
              </div>

              <div className="flex space-x-2 items-end">
                <Button variant="primary" onClick={handleApplyFilters} className="flex-1">
                  {t('incidents.page.applyButton')}
                </Button>
                <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                  {t('incidents.page.clearButton')}
                </Button>
              </div>
            </div>
          </div>

          <Card noPadding>
            <Table
              columns={columns}
              data={incidents}
              keyExtractor={(incident) => incident.id}
              onRowClick={(incident) => goToIncidentDetail(incident.id)}
              emptyMessage={t('incidents.page.emptyMessage')}
            />
          </Card>
        </>
      ) : (
        <IncidentsChartView incidents={incidents} />
      )}
    </div>
  );
};

export default IncidentsPage;
