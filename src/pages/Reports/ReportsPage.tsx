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

  const handleExportPDF = () => {
    // TODO: Implement PDF export
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
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
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
      />

      {currentReport && (
        <ReportStatistics report={currentReport} />
      )}
    </div>
  );
};

export default ReportsPage;
