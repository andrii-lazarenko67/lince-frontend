import React from 'react';
import { useAppSelector, useAppNavigation } from '../../hooks';
import { Table, Badge } from '../../components/common';
import type { Inspection } from '../../types';

const InspectionsList: React.FC = () => {
  const { inspections } = useAppSelector((state) => state.inspections);
  const { goToInspectionDetail } = useAppNavigation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (inspection: Inspection) => (
        <span className="font-medium text-gray-900">
          {new Date(inspection.date).toLocaleDateString()}
        </span>
      )
    },
    {
      key: 'system',
      header: 'System',
      render: (inspection: Inspection) => inspection.system?.name || '-'
    },
    {
      key: 'user',
      header: 'Inspector',
      render: (inspection: Inspection) => inspection.user?.name || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (inspection: Inspection) => getStatusBadge(inspection.status)
    },
    {
      key: 'items',
      header: 'Items',
      render: (inspection: Inspection) => {
        const total = inspection.items?.length || 0;
        const conforme = inspection.items?.filter(i => i.status === 'C').length || 0;
        const noConforme = inspection.items?.filter(i => i.status === 'NC').length || 0;
        return (
          <div className="flex items-center space-x-2">
            <span>{conforme}/{total} conforme</span>
            {noConforme > 0 && (
              <Badge variant="danger">{noConforme} NC</Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (inspection: Inspection) => new Date(inspection.createdAt).toLocaleString()
    }
  ];

  return (
    <Table
      columns={columns}
      data={inspections}
      keyExtractor={(inspection) => inspection.id}
      onRowClick={(inspection) => goToInspectionDetail(inspection.id)}
      emptyMessage="No inspections found. Click 'New Inspection' to create one."
    />
  );
};

export default InspectionsList;
