import React, { useEffect, useState } from 'react';
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

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      type: e.target.value
    });
  };

  const handleSystemToggle = (systemId: number) => {
    setFormData(prev => ({
      ...prev,
      systemIds: prev.systemIds.includes(systemId)
        ? prev.systemIds.filter(id => id !== systemId)
        : [...prev.systemIds, systemId]
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
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined
    }));
  };

  const getReportSections = (report: ReportData) => {
    return {
      dailyLogs: {
        title: `Daily Logs (${report.dailyLogs.length})`,
        headers: ['Date', 'System', 'User', 'Entries', 'Notes'],
        rows: report.dailyLogs.map(log => [
          log.date,
          log.system?.name || '-',
          log.user?.name || '-',
          log.entries?.length || 0,
          log.notes || '-'
        ])
      },
      inspections: {
        title: `Inspections (${report.inspections.length})`,
        headers: ['Date', 'System', 'User', 'Status', 'Conclusion', 'Items'],
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
        title: `Incidents (${report.incidents.length})`,
        headers: ['Title', 'System', 'Priority', 'Status', 'Reporter', 'Assignee', 'Created'],
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
        title: `Products (${report.products.length})`,
        headers: ['Name', 'Type', 'Current Stock', 'Unit', 'Min Alert', 'Supplier'],
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
        title: `Product Usages (${report.productUsages.length})`,
        headers: ['Date', 'Product', 'Type', 'Quantity', 'System', 'User', 'Notes'],
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
        title: 'LINCE Water Treatment Report',
        filename: `lince-report-${report.type}-${report.period.startDate}-${report.period.endDate}`,
        metadata: [
          { label: 'Report Type', value: report.type.charAt(0).toUpperCase() + report.type.slice(1) },
          { label: 'Period', value: `${report.period.startDate} to ${report.period.endDate}` },
          { label: 'Generated', value: new Date(report.generatedAt).toLocaleString() }
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
      { title: 'DAILY LOGS', headers: sections.dailyLogs.headers, rows: sections.dailyLogs.rows },
      { title: 'INSPECTIONS', headers: sections.inspections.headers, rows: sections.inspections.rows },
      { title: 'INCIDENTS', headers: sections.incidents.headers, rows: sections.incidents.rows },
      { title: 'PRODUCTS', headers: sections.products.headers, rows: sections.products.rows },
      { title: 'PRODUCT USAGES', headers: sections.productUsages.headers, rows: sections.productUsages.rows }
    ];

    exportToCsv(
      {
        title: 'LINCE Water Treatment Report',
        filename: `lince-report-${report.type}-${report.period.startDate}-${report.period.endDate}`,
        metadata: [
          { label: 'Type', value: report.type },
          { label: 'Period', value: `${report.period.startDate} to ${report.period.endDate}` },
          { label: 'Generated', value: new Date(report.generatedAt).toISOString() }
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
        title: 'LINCE Water Treatment Report',
        subtitle: `${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report`,
        filename: `lince-report-${report.type}-${report.period.startDate}-${report.period.endDate}`,
        metadata: [
          { label: 'Report Type', value: report.type.charAt(0).toUpperCase() + report.type.slice(1) },
          { label: 'Period', value: `${report.period.startDate} to ${report.period.endDate}` },
          { label: 'Generated', value: new Date(report.generatedAt).toLocaleString() }
        ]
      },
      pdfSections
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export monitoring reports</p>
        </div>
      </div>

      <ReportConfiguration
        formData={formData}
        systems={systems}
        isGenerating={isGenerating}
        hasReport={!!currentReport}
        onTypeChange={handleTypeChange}
        onSystemToggle={handleSystemToggle}
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
