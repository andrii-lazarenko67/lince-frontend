import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchInspections } from '../../store/slices/inspectionSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Select, DateInput, ExportDropdown, ViewModeToggle } from '../../components/common';
import InspectionsList from "./InspectionsList"
import InspectionsChartView from './InspectionsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';

const InspectionsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { inspections } = useAppSelector((state) => state.inspections);
  const { goToNewInspection } = useAppNavigation();

  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [filters, setFilters] = useState({
    systemId: '',
    stageId: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    dispatch(fetchSystems({ parentId: 'null' }));
    dispatch(fetchInspections({}));
  }, [dispatch]);

  const handleApplyFilters = () => {
    dispatch(fetchInspections({
      systemId: filters.systemId ? Number(filters.systemId) : undefined,
      stageId: filters.stageId ? Number(filters.stageId) : undefined,
      status: filters.status || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined
    }));
  };

  const handleClearFilters = () => {
    setFilters({ systemId: '', stageId: '', status: '', startDate: '', endDate: '' });
    dispatch(fetchInspections({}));
  };

  const getExportData = () => {
    const headers = [t('inspections.export.date'), t('inspections.export.system'), t('inspections.export.inspector'), t('inspections.export.status'), t('inspections.export.conclusion'), t('inspections.export.items')];
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
    { value: 'completed', label: t('inspections.filters.completed') },
    { value: 'viewed', label: t('inspections.filters.viewed') }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inspections.title')}</h1>
          <p className="text-gray-500 mt-1">{t('inspections.description')}</p>
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
            disabled={inspections.length === 0}
          />
          <Button variant="primary" onClick={goToNewInspection}>
            {t('inspections.newInspection')}
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <>
          <div className="bg-white rounded-lg shadow p-4">
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
