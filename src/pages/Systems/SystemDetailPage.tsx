import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchSystemById, deleteSystem } from '../../store/slices/systemSlice';
import { fetchMonitoringPoints, deleteMonitoringPoint as deleteMonitoringPointAction } from '../../store/slices/monitoringPointSlice';
import { Card, Button, Badge, Table, Modal } from '../../components/common';
import SystemForm from "./SystemForm";
import MonitoringPointForm from './MonitoringPointForm';
import PhotoGallery from '../../components/PhotoGallery';
import type { MonitoringPoint } from '../../types';

const SystemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentSystem } = useAppSelector((state) => state.systems);
  const { monitoringPoints } = useAppSelector((state) => state.monitoringPoints);
  const { goBack, goToSystems } = useAppNavigation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isMonitoringPointFormOpen, setIsMonitoringPointFormOpen] = useState(false);
  const [editingMonitoringPoint, setEditingMonitoringPoint] = useState<MonitoringPoint | null>(null);
  const [deletingMonitoringPoint, setDeletingMonitoringPoint] = useState<MonitoringPoint | null>(null);
  const [isDeleteMonitoringPointOpen, setIsDeleteMonitoringPointOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchSystemById(Number(id)));
      dispatch(fetchMonitoringPoints({ systemId: Number(id) }));
    }
  }, [dispatch, id]);

  const handleDeleteSystem = async () => {
    if (id) {
      const result = await dispatch(deleteSystem(Number(id)));
      if (deleteSystem.fulfilled.match(result)) {
        goToSystems();
      }
    }
  };

  const handleOpenMonitoringPointForm = (point?: MonitoringPoint) => {
    if (point) {
      setEditingMonitoringPoint(point);
    } else {
      setEditingMonitoringPoint(null);
    }
    setIsMonitoringPointFormOpen(true);
  };

  const handleCloseMonitoringPointForm = () => {
    setIsMonitoringPointFormOpen(false);
    setEditingMonitoringPoint(null);
  };

  const handleOpenDeleteMonitoringPoint = (point: MonitoringPoint) => {
    setDeletingMonitoringPoint(point);
    setIsDeleteMonitoringPointOpen(true);
  };

  const handleDeleteMonitoringPoint = async () => {
    if (deletingMonitoringPoint) {
      const result = await dispatch(deleteMonitoringPointAction(deletingMonitoringPoint.id));
      if (deleteMonitoringPointAction.fulfilled.match(result)) {
        setIsDeleteMonitoringPointOpen(false);
        setDeletingMonitoringPoint(null);
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
      header: 'Parameter',
      render: (point: MonitoringPoint) => point.parameterObj?.name || '-'
    },
    {
      key: 'unit',
      header: 'Unit',
      render: (point: MonitoringPoint) => point.unitObj?.abbreviation || '-'
    },
    {
      key: 'range',
      header: 'Range',
      render: (point: MonitoringPoint) => (
        <span className={point.minValue === null || point.maxValue === null ? 'text-gray-400' : ''}>
          {point.minValue !== null && point.maxValue !== null
            ? `${point.minValue} - ${point.maxValue}`
            : 'N/A'}
        </span>
      )
    },
    {
      key: 'alertEnabled',
      header: 'Alerts',
      render: (point: MonitoringPoint) => (
        <Badge variant={point.alertEnabled ? 'primary' : 'secondary'}>
          {point.alertEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (point: MonitoringPoint) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenMonitoringPointForm(point)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleOpenDeleteMonitoringPoint(point)}>
            Delete
          </Button>
        </div>
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
            {currentSystem.parent && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Parent System</dt>
                <dd className="mt-1 text-gray-900">
                  <button
                    onClick={() => window.location.href = `/systems/${currentSystem.parent?.id}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {currentSystem.parent.name} ({currentSystem.parent.type})
                  </button>
                </dd>
              </div>
            )}
            {currentSystem.children && currentSystem.children.length > 0 && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Sub-Systems</dt>
                <dd className="mt-1">
                  <ul className="space-y-1">
                    {currentSystem.children.map(child => (
                      <li key={child.id}>
                        <button
                          onClick={() => window.location.href = `/systems/${child.id}`}
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          {child.name} ({child.type})
                        </button>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
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

        <Card
          title="Monitoring Points"
          className="lg:col-span-2"
          noPadding
          headerActions={
            <Button variant="primary" size="sm" onClick={() => handleOpenMonitoringPointForm()}>
              Add Point
            </Button>
          }
        >
          <Table
            columns={monitoringPointColumns}
            data={monitoringPoints}
            keyExtractor={(point) => point.id}
            emptyMessage="No monitoring points configured for this system."
          />
        </Card>
      </div>

      <PhotoGallery systemId={currentSystem.id} systemName={currentSystem.name} />

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
          <Button variant="danger" onClick={handleDeleteSystem}>
            Delete
          </Button>
        </div>
      </Modal>

      <MonitoringPointForm
        isOpen={isMonitoringPointFormOpen}
        onClose={handleCloseMonitoringPointForm}
        systemId={Number(id)}
        monitoringPoint={editingMonitoringPoint}
      />

      <Modal
        isOpen={isDeleteMonitoringPointOpen}
        onClose={() => setIsDeleteMonitoringPointOpen(false)}
        title="Delete Monitoring Point"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{deletingMonitoringPoint?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteMonitoringPointOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteMonitoringPoint}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SystemDetailPage;
