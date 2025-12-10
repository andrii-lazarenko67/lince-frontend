import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppNavigation } from '../../hooks';
import { Table, Badge } from '../../components/common';
import type { Inspection } from '../../types';

const InspectionsList: React.FC = () => {
  const { t } = useTranslation();
  const { inspections } = useAppSelector((state) => state.inspections);
  const { goToInspectionDetail } = useAppNavigation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">{t('inspections.status.pending')}</Badge>;
      case 'approved':
        return <Badge variant="success">{t('inspections.status.approved')}</Badge>;
      case 'rejected':
        return <Badge variant="danger">{t('inspections.status.rejected')}</Badge>;
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
    <Table
      columns={columns}
      data={inspections}
      keyExtractor={(inspection) => inspection.id}
      onRowClick={(inspection) => goToInspectionDetail(inspection.id)}
      emptyMessage={t('inspections.list.emptyMessage')}
    />
  );
};

export default InspectionsList;
