import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, ExportDropdown, ViewModeToggle } from '../../components/common';
import SystemsList from "./SystemsList";
import SystemForm from "./SystemForm";
import SystemsChartView from './SystemsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';

const SystemsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedClientId } = useAppSelector((state) => state.clients);
  const { systems } = useAppSelector((state) => state.systems);
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSystems({}));
  }, [dispatch, selectedClientId]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('systems.active');
      case 'inactive': return t('systems.inactive');
      case 'maintenance': return t('systems.maintenance');
      default: return status;
    }
  };

  const getExportData = () => {
    const headers = [t('common.name'), t('common.location'), t('common.type'), t('common.status'), t('systems.createdAt')];
    const rows = systems.map(sys => [
      sys.name,
      sys.location || '-',
      sys.systemType?.name || '-',
      getStatusLabel(sys.status),
      new Date(sys.createdAt).toLocaleDateString()
    ]);
    return { headers, rows };
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: t('systems.title'),
        subtitle: t('common.exportFooter'),
        filename: `systems-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('systems.title'), value: String(systems.length) },
          { label: t('systems.active'), value: String(systems.filter(s => s.status === 'active').length) },
          { label: t('common.date'), value: new Date().toLocaleString() }
        ],
        footerText: `${t('common.exportFooter')} - ${new Date().toLocaleString()}`
      },
      [{ title: `${t('systems.title')} (${systems.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: t('systems.title'),
        filename: `systems-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('systems.title'), value: String(systems.length) },
          { label: t('systems.active'), value: String(systems.filter(s => s.status === 'active').length) },
          { label: t('common.date'), value: new Date().toLocaleString() }
        ]
      },
      [{ title: `${t('systems.title')} (${systems.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: t('systems.title'),
        filename: `systems-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('systems.title'), value: String(systems.length) },
          { label: t('systems.active'), value: String(systems.filter(s => s.status === 'active').length) },
          { label: t('common.date'), value: new Date().toISOString() }
        ]
      },
      [{ title: t('systems.title').toUpperCase(), headers, rows }]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('systems.title')}</h1>
          <p className="text-gray-500 mt-1">{t('nav.systems')}</p>
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
            disabled={systems.length === 0}
          />
          <Button variant="primary" onClick={() => setIsFormOpen(true)}>
            {t('systems.addSystem')}
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card noPadding>
          <SystemsList />
        </Card>
      ) : (
        <SystemsChartView systems={systems} />
      )}

      <SystemForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};

export default SystemsPage;
