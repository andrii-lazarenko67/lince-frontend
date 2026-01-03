import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Select, DateInput } from '../../components/common';
import type { System } from '../../types';

interface ReportConfigurationProps {
  formData: {
    type: string;
    systemIds: number[];
    stageIds: number[];
    startDate: string;
    endDate: string;
  };
  systems: System[];
  availableStages: System[];
  isGenerating: boolean;
  hasReport: boolean;
  onTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSystemToggle: (systemId: number) => void;
  onStageToggle: (stageId: number) => void;
  onDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  onExportPDF: () => void;
  onExportHTML: () => void;
  onExportCSV: () => void;
}

const ReportConfiguration: React.FC<ReportConfigurationProps> = ({
  formData,
  systems,
  availableStages,
  isGenerating,
  hasReport,
  onTypeChange,
  onSystemToggle,
  onStageToggle,
  onDateChange,
  onGenerate,
  onExportPDF,
  onExportHTML,
  onExportCSV
}) => {
  const { t } = useTranslation();

  const typeOptions = [
    { value: 'daily', label: t('reports.config.daily') },
    { value: 'weekly', label: t('reports.config.weekly') },
    { value: 'monthly', label: t('reports.config.monthly') },
    { value: 'custom', label: t('reports.config.custom') }
  ];

  return (
    <Card title={t('reports.config.title')}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Type and Date Range Container */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">{t('reports.config.typePeriod')}</h4>
          <Select
            name="type"
            value={formData.type}
            onChange={onTypeChange}
            options={typeOptions}
            label={t('reports.config.reportType')}
          />

          {formData.type === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <DateInput
                name="startDate"
                value={formData.startDate}
                onChange={onDateChange}
                label={t('reports.config.startDate')}
              />

              <DateInput
                name="endDate"
                value={formData.endDate}
                onChange={onDateChange}
                label={t('reports.config.endDate')}
              />
            </div>
          )}
        </div>

        {/* Systems Container */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">{t('reports.config.systemsFilter')}</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('reports.config.selectSystems')}</label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {systems.length === 0 ? (
                <p className="text-sm text-gray-500">{t('reports.config.noSystems')}</p>
              ) : (
                systems.map(system => (
                  <label key={system.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.systemIds.includes(system.id)}
                      onChange={() => onSystemToggle(system.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{system.name}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.systemIds.length === 0
                ? t('reports.config.noSystemsSelected')
                : t('reports.config.systemsSelected', { count: formData.systemIds.length })}
            </p>
          </div>

          {/* Stages Filter - only show when systems are selected and have stages */}
          {availableStages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('reports.config.selectStages')}</label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {availableStages.map(stage => (
                  <label key={stage.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.stageIds.includes(stage.id)}
                      onChange={() => onStageToggle(stage.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{stage.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.stageIds.length === 0
                  ? t('reports.config.noStagesSelected')
                  : t('reports.config.stagesSelected', { count: formData.stageIds.length })}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
        <Button variant="primary" onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? t('reports.config.generating') : t('reports.config.generateReport')}
        </Button>
        {hasReport && (
          <>
            <Button variant="outline" onClick={onExportPDF}>
              {t('reports.config.exportPDF')}
            </Button>
            <Button variant="outline" onClick={onExportHTML}>
              {t('reports.config.exportHTML')}
            </Button>
            <Button variant="outline" onClick={onExportCSV}>
              {t('reports.config.exportCSV')}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default ReportConfiguration;
