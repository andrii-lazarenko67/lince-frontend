import React from 'react';
import { useAppSelector, useAppNavigation } from '../../../hooks';
import { Table, Badge } from '../../../components/common';
import { System } from '../../../types';

const SystemsList: React.FC = () => {
  const { systems } = useAppSelector((state) => state.systems);
  const { goToSystemDetail } = useAppNavigation();

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (system: System) => (
        <span className="font-medium text-gray-900">{system.name}</span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (system: System) => (
        <span className="capitalize">{system.type}</span>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (system: System) => system.location || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (system: System) => (
        <Badge variant={system.status === 'active' ? 'success' : 'secondary'}>
          {system.status}
        </Badge>
      )
    },
    {
      key: 'monitoringPoints',
      header: 'Monitoring Points',
      render: (system: System) => system.monitoringPoints?.length || 0
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (system: System) => new Date(system.createdAt).toLocaleDateString()
    }
  ];

  return (
    <Table
      columns={columns}
      data={systems}
      keyExtractor={(system) => system.id}
      onRowClick={(system) => goToSystemDetail(system.id)}
      emptyMessage="No systems found. Click 'Add System' to create one."
    />
  );
};

export default SystemsList;
