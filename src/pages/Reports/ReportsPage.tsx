import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchSystems } from '../../store/slices/systemSlice';
import { generateReport } from '../../store/slices/reportSlice';
import ReportConfiguration from './ReportConfiguration';
import ReportStatistics from "./ReportStatistics";
import {
  exportToHtml,
  exportToCsv,
  exportToPdf,
  getStatusClass,
  getPriorityClass,
  type HtmlTableSection,
  type CsvSection,
  type PdfTableSection
} from '../../utils';

import type { ReportType, ReportData } from '../../types';

const ReportsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { systems } = useAppSelector((state) => state.systems);
  const { currentReport, isGenerating } = useAppSelector((state) => state.reports);

  const [formData, setFormData] = useState({
    type: 'daily',
    systemIds: [] as number[],
    stageIds: [] as number[],
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    dispatch(fetchSystems({}));
  }, [dispatch]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      type: e.target.value
    });
  };

  const handleSystemToggle = (systemId: number) => {
    setFormData(prev => {
      const newSystemIds = prev.systemIds.includes(systemId)
        ? prev.systemIds.filter(id => id !== systemId)
        : [...prev.systemIds, systemId];

      // When a system is deselected, also remove its stages from stageIds
      const selectedSystem = systems.find(s => s.id === systemId);
      const stageIdsToRemove = selectedSystem?.children?.map(c => c.id) || [];
      const newStageIds = prev.systemIds.includes(systemId)
        ? prev.stageIds.filter(id => !stageIdsToRemove.includes(id))
        : prev.stageIds;

      return {
        ...prev,
        systemIds: newSystemIds,
        stageIds: newStageIds
      };
    });
  };

  const handleStageToggle = (stageId: number) => {
    setFormData(prev => ({
      ...prev,
      stageIds: prev.stageIds.includes(stageId)
        ? prev.stageIds.filter(id => id !== stageId)
        : [...prev.stageIds, stageId]
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerate = () => {
    dispatch(generateReport({
      type: formData.type as ReportType,
      systemIds: formData.systemIds.length > 0 ? formData.systemIds : undefined,
      stageIds: formData.stageIds.length > 0 ? formData.stageIds : undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined
    }));
  };

  const getReportSections = (report: ReportData) => {
    return {
      dailyLogs: {
        title: `${t('reports.sections.dailyLogs')} (${report.dailyLogs.length})`,
        headers: [t('reports.headers.date'), t('reports.headers.system'), t('reports.headers.user'), t('reports.headers.entries'), t('reports.headers.notes')],
        rows: report.dailyLogs.map(log => [
          log.date,
          log.system?.name || '-',
          log.user?.name || '-',
          log.entries?.length || 0,
          log.notes || '-'
        ])
      },
      inspections: {
        title: `${t('reports.sections.inspections')} (${report.inspections.length})`,
        headers: [t('reports.headers.date'), t('reports.headers.system'), t('reports.headers.user'), t('reports.headers.status'), t('reports.headers.conclusion'), t('reports.headers.items')],
        rows: report.inspections.map(insp => [
          new Date(insp.date).toLocaleDateString(),
          insp.system?.name || '-',
          insp.user?.name || '-',
          insp.status,
          insp.conclusion || '-',
          insp.items?.length || 0
        ])
      },
      incidents: {
        title: `${t('reports.sections.incidents')} (${report.incidents.length})`,
        headers: [t('reports.headers.title'), t('reports.headers.system'), t('reports.headers.priority'), t('reports.headers.status'), t('reports.headers.reporter'), t('reports.headers.assignee'), t('reports.headers.created')],
        rows: report.incidents.map(inc => [
          inc.title,
          inc.system?.name || '-',
          inc.priority,
          inc.status,
          inc.reporter?.name || '-',
          inc.assignee?.name || '-',
          new Date(inc.createdAt).toLocaleDateString()
        ])
      },
      products: {
        title: `${t('reports.sections.products')} (${report.products.length})`,
        headers: [t('reports.headers.name'), t('reports.headers.type'), t('reports.headers.currentStock'), t('reports.headers.unit'), t('reports.headers.minAlert'), t('reports.headers.supplier')],
        rows: report.products.map(prod => [
          prod.name,
          prod.type,
          prod.currentStock,
          prod.unit,
          prod.minStockAlert || '-',
          prod.supplier || '-'
        ])
      },
      productUsages: {
        title: `${t('reports.sections.productUsages')} (${report.productUsages.length})`,
        headers: [t('reports.headers.date'), t('reports.headers.product'), t('reports.headers.type'), t('reports.headers.quantity'), t('reports.headers.system'), t('reports.headers.user'), t('reports.headers.notes')],
        rows: report.productUsages.map(usage => [
          new Date(usage.date).toLocaleDateString(),
          usage.product?.name || '-',
          usage.type,
          usage.quantity,
          usage.system?.name || '-',
          usage.user?.name || '-',
          usage.notes || '-'
        ])
      }
    };
  };

  const handleExportHTML = () => {
    if (!currentReport) return;

    const report = currentReport;
    const sections = getReportSections(report);

    const htmlSections: HtmlTableSection[] = [
      sections.dailyLogs,
      sections.inspections,
      {
        ...sections.incidents,
        cellClasses: [
          undefined,
          undefined,
          (value) => getPriorityClass(String(value)),
          (value) => getStatusClass(String(value)),
          undefined,
          undefined,
          undefined
        ]
      } as HtmlTableSection,
      sections.products,
      sections.productUsages
    ];

    exportToHtml(
      {
        title: t('reports.export.title'),
        filename: `lince-report-${report.type}-${report.period.startDate}-${report.period.endDate}`,
        metadata: [
          { label: t('reports.export.reportType'), value: report.type.charAt(0).toUpperCase() + report.type.slice(1) },
          { label: t('reports.export.period'), value: `${report.period.startDate} to ${report.period.endDate}` },
          { label: t('reports.export.generated'), value: new Date(report.generatedAt).toLocaleString() }
        ]
      },
      htmlSections
    );
  };

  const handleExportCSV = () => {
    if (!currentReport) return;

    const report = currentReport;
    const sections = getReportSections(report);

    const csvSections: CsvSection[] = [
      { title: t('reports.sections.dailyLogsUpper'), headers: sections.dailyLogs.headers, rows: sections.dailyLogs.rows },
      { title: t('reports.sections.inspectionsUpper'), headers: sections.inspections.headers, rows: sections.inspections.rows },
      { title: t('reports.sections.incidentsUpper'), headers: sections.incidents.headers, rows: sections.incidents.rows },
      { title: t('reports.sections.productsUpper'), headers: sections.products.headers, rows: sections.products.rows },
      { title: t('reports.sections.productUsagesUpper'), headers: sections.productUsages.headers, rows: sections.productUsages.rows }
    ];

    exportToCsv(
      {
        title: t('reports.export.title'),
        filename: `lince-report-${report.type}-${report.period.startDate}-${report.period.endDate}`,
        metadata: [
          { label: t('reports.export.type'), value: report.type },
          { label: t('reports.export.period'), value: `${report.period.startDate} to ${report.period.endDate}` },
          { label: t('reports.export.generated'), value: new Date(report.generatedAt).toISOString() }
        ]
      },
      csvSections
    );
  };

  const handleExportPDF = () => {
    if (!currentReport) return;

    const report = currentReport;
    const sections = getReportSections(report);

    const pdfSections: PdfTableSection[] = [
      sections.dailyLogs,
      sections.inspections,
      sections.incidents,
      sections.products,
      sections.productUsages
    ];

    exportToPdf(
      {
        title: t('reports.export.title'),
        subtitle: `${report.type.charAt(0).toUpperCase() + report.type.slice(1)} ${t('reports.export.report')}`,
        filename: `lince-report-${report.type}-${report.period.startDate}-${report.period.endDate}`,
        metadata: [
          { label: t('reports.export.reportType'), value: report.type.charAt(0).toUpperCase() + report.type.slice(1) },
          { label: t('reports.export.period'), value: `${report.period.startDate} to ${report.period.endDate}` },
          { label: t('reports.export.generated'), value: new Date(report.generatedAt).toLocaleString() }
        ]
      },
      pdfSections
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="text-gray-500 mt-1">{t('reports.description')}</p>
        </div>
      </div>

      <ReportConfiguration
        formData={formData}
        systems={systems}
        isGenerating={isGenerating}
        hasReport={!!currentReport}
        onTypeChange={handleTypeChange}
        onSystemToggle={handleSystemToggle}
        onStageToggle={handleStageToggle}
        onDateChange={handleDateChange}
        onGenerate={handleGenerate}
        onExportPDF={handleExportPDF}
        onExportHTML={handleExportHTML}
        onExportCSV={handleExportCSV}
      />

      {currentReport && (
        <ReportStatistics report={currentReport} />
      )}
    </div>
  );
};

export default ReportsPage;
