import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchSystems } from '../../store/slices/systemSlice';
import { generateReport } from '../../store/slices/reportSlice';
import { ReportConfiguration, ReportStatistics } from './sections';
import type { ReportType } from '../../types';

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

  const handleExportHTML = () => {
    if (!currentReport) return;

    const report = currentReport;
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>LINCE Report - ${report.type}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    h1 { color: #1a56db; border-bottom: 2px solid #1a56db; padding-bottom: 10px; }
    h2 { color: #374151; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; }
    th { background-color: #f3f4f6; font-weight: 600; }
    tr:nth-child(even) { background-color: #f9fafb; }
    .info { background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
    .status-open { color: #dc2626; }
    .status-resolved { color: #16a34a; }
    .priority-critical { color: #dc2626; font-weight: bold; }
    .priority-high { color: #ea580c; }
  </style>
</head>
<body>
  <h1>LINCE Water Treatment Report</h1>
  <div class="info">
    <p><strong>Report Type:</strong> ${report.type.charAt(0).toUpperCase() + report.type.slice(1)}</p>
    <p><strong>Period:</strong> ${report.period.startDate} to ${report.period.endDate}</p>
    <p><strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleString()}</p>
  </div>

  <h2>Daily Logs (${report.dailyLogs.length})</h2>
  <table>
    <tr><th>Date</th><th>System</th><th>User</th><th>Entries</th><th>Notes</th></tr>
    ${report.dailyLogs.map(log => `
      <tr>
        <td>${log.date}</td>
        <td>${log.system?.name || '-'}</td>
        <td>${log.user?.name || '-'}</td>
        <td>${log.entries?.length || 0}</td>
        <td>${log.notes || '-'}</td>
      </tr>
    `).join('')}
  </table>

  <h2>Inspections (${report.inspections.length})</h2>
  <table>
    <tr><th>Date</th><th>System</th><th>User</th><th>Status</th><th>Conclusion</th><th>Items</th></tr>
    ${report.inspections.map(insp => `
      <tr>
        <td>${new Date(insp.date).toLocaleDateString()}</td>
        <td>${insp.system?.name || '-'}</td>
        <td>${insp.user?.name || '-'}</td>
        <td>${insp.status}</td>
        <td>${insp.conclusion || '-'}</td>
        <td>${insp.items?.length || 0}</td>
      </tr>
    `).join('')}
  </table>

  <h2>Incidents (${report.incidents.length})</h2>
  <table>
    <tr><th>Title</th><th>System</th><th>Priority</th><th>Status</th><th>Reporter</th><th>Assignee</th><th>Created</th></tr>
    ${report.incidents.map(inc => `
      <tr>
        <td>${inc.title}</td>
        <td>${inc.system?.name || '-'}</td>
        <td class="priority-${inc.priority}">${inc.priority}</td>
        <td class="status-${inc.status}">${inc.status}</td>
        <td>${inc.reporter?.name || '-'}</td>
        <td>${inc.assignee?.name || '-'}</td>
        <td>${new Date(inc.createdAt).toLocaleDateString()}</td>
      </tr>
    `).join('')}
  </table>

  <h2>Products (${report.products.length})</h2>
  <table>
    <tr><th>Name</th><th>Type</th><th>Current Stock</th><th>Unit</th><th>Min Alert</th><th>Supplier</th></tr>
    ${report.products.map(prod => `
      <tr>
        <td>${prod.name}</td>
        <td>${prod.type}</td>
        <td>${prod.currentStock}</td>
        <td>${prod.unit}</td>
        <td>${prod.minStockAlert || '-'}</td>
        <td>${prod.supplier || '-'}</td>
      </tr>
    `).join('')}
  </table>

  <h2>Product Usages (${report.productUsages.length})</h2>
  <table>
    <tr><th>Date</th><th>Product</th><th>Type</th><th>Quantity</th><th>System</th><th>User</th><th>Notes</th></tr>
    ${report.productUsages.map(usage => `
      <tr>
        <td>${new Date(usage.date).toLocaleDateString()}</td>
        <td>${usage.product?.name || '-'}</td>
        <td>${usage.type}</td>
        <td>${usage.quantity}</td>
        <td>${usage.system?.name || '-'}</td>
        <td>${usage.user?.name || '-'}</td>
        <td>${usage.notes || '-'}</td>
      </tr>
    `).join('')}
  </table>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lince-report-${report.type}-${report.period.startDate}-${report.period.endDate}.html`;
    link.click();
  };

  const handleExportCSV = () => {
    if (!currentReport) return;

    const report = currentReport;
    let csv = 'LINCE Water Treatment Report\n';
    csv += `Type,${report.type}\n`;
    csv += `Period,${report.period.startDate} to ${report.period.endDate}\n`;
    csv += `Generated,${new Date(report.generatedAt).toISOString()}\n\n`;

    // Daily Logs
    csv += 'DAILY LOGS\n';
    csv += 'Date,System,User,Entries Count,Notes\n';
    report.dailyLogs.forEach(log => {
      csv += `"${log.date}","${log.system?.name || ''}","${log.user?.name || ''}",${log.entries?.length || 0},"${(log.notes || '').replace(/"/g, '""')}"\n`;
    });

    // Inspections
    csv += '\nINSPECTIONS\n';
    csv += 'Date,System,User,Status,Conclusion,Items Count\n';
    report.inspections.forEach(insp => {
      csv += `"${new Date(insp.date).toLocaleDateString()}","${insp.system?.name || ''}","${insp.user?.name || ''}","${insp.status}","${(insp.conclusion || '').replace(/"/g, '""')}",${insp.items?.length || 0}\n`;
    });

    // Incidents
    csv += '\nINCIDENTS\n';
    csv += 'Title,System,Priority,Status,Reporter,Assignee,Created At,Description\n';
    report.incidents.forEach(inc => {
      csv += `"${(inc.title || '').replace(/"/g, '""')}","${inc.system?.name || ''}","${inc.priority}","${inc.status}","${inc.reporter?.name || ''}","${inc.assignee?.name || ''}","${new Date(inc.createdAt).toLocaleString()}","${(inc.description || '').replace(/"/g, '""')}"\n`;
    });

    // Products
    csv += '\nPRODUCTS\n';
    csv += 'Name,Type,Current Stock,Unit,Min Alert,Supplier\n';
    report.products.forEach(prod => {
      csv += `"${prod.name}","${prod.type}",${prod.currentStock},"${prod.unit}",${prod.minStockAlert || ''},"${prod.supplier || ''}"\n`;
    });

    // Product Usages
    csv += '\nPRODUCT USAGES\n';
    csv += 'Date,Product,Type,Quantity,System,User,Notes\n';
    report.productUsages.forEach(usage => {
      csv += `"${new Date(usage.date).toLocaleDateString()}","${usage.product?.name || ''}","${usage.type}",${usage.quantity},"${usage.system?.name || ''}","${usage.user?.name || ''}","${(usage.notes || '').replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lince-report-${report.type}-${report.period.startDate}-${report.period.endDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 mt-1">Generate and export monitoring reports</p>
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
        onExportPDF={handleExportHTML}
        onExportCSV={handleExportCSV}
      />

      {currentReport && (
        <ReportStatistics report={currentReport} />
      )}
    </div>
  );
};

export default ReportsPage;
