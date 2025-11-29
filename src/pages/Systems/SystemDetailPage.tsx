import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchSystemById, deleteSystem } from '../../store/slices/systemSlice';
import { fetchMonitoringPoints } from '../../store/slices/monitoringPointSlice';
import { Card, Button, Badge, Table, Modal } from '../../components/common';
import { SystemForm } from './sections';
import { MonitoringPoint } from '../../types';

const SystemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentSystem } = useAppSelector((state) => state.systems);
  const { monitoringPoints } = useAppSelector((state) => state.monitoringPoints);
  const { goBack, goToSystems } = useAppNavigation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchSystemById(Number(id)));
      dispatch(fetchMonitoringPoints(Number(id)));
    }
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (id) {
      const result = await dispatch(deleteSystem(Number(id)));
      if (deleteSystem.fulfilled.match(result)) {
        goToSystems();
      }
    }
  };

  const monitoringPointColumns = [
    {
      key: 'name',
      header: 'Name',
      render: (point: MonitoringPoint) => (
        <span className="font-medium text-gray-900">{point.name}</span>
      )
    },
    {
      key: 'parameter',
      header: 'Parameter'
    },
    {
      key: 'unit',
      header: 'Unit'
    },
    {
      key: 'range',
      header: 'Range',
      render: (point: MonitoringPoint) => (
        <span>
          {point.minValue !== null && point.maxValue !== null
            ? `${point.minValue} - ${point.maxValue}`
            : '-'}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (point: MonitoringPoint) => (
        <Badge variant={point.isActive ? 'success' : 'secondary'}>
          {point.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  if (!currentSystem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading system details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={goBack} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentSystem.name}</h1>
            <p className="text-gray-500 mt-1 capitalize">{currentSystem.type}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="System Details" className="lg:col-span-1">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <Badge variant={currentSystem.status === 'active' ? 'success' : 'secondary'}>
                  {currentSystem.status}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-gray-900">{currentSystem.location || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-gray-900">{currentSystem.description || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-gray-900">
                {new Date(currentSystem.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Monitoring Points" className="lg:col-span-2" noPadding>
          <Table
            columns={monitoringPointColumns}
            data={monitoringPoints}
            keyExtractor={(point) => point.id}
            emptyMessage="No monitoring points configured for this system."
          />
        </Card>
      </div>

      <SystemForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        system={currentSystem}
      />

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete System" size="sm">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this system? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SystemDetailPage;
