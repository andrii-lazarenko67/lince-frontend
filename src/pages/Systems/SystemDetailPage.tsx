import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchSystemById, deleteSystem } from '../../store/slices/systemSlice';
import { fetchMonitoringPoints, deleteMonitoringPoint as deleteMonitoringPointAction } from '../../store/slices/monitoringPointSlice';
import { fetchChecklistItemsBySystem, deleteChecklistItem as deleteChecklistItemAction } from '../../store/slices/checklistItemSlice';
import { Card, Button, Badge, Table, Modal } from '../../components/common';
import SystemForm from "./SystemForm";
import MonitoringPointForm from './MonitoringPointForm';
import ChecklistItemForm from './ChecklistItemForm';
import PhotoGallery from '../../components/PhotoGallery';
import type { MonitoringPoint, ChecklistItem } from '../../types';
import { useTour, useAutoStartTour, SYSTEMS_DETAIL_TOUR } from '../../tours';
import { HelpOutline } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

const SystemDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentSystem } = useAppSelector((state) => state.systems);
  const { monitoringPoints } = useAppSelector((state) => state.monitoringPoints);
  const { checklistItems } = useAppSelector((state) => state.checklistItems);
  const { loading } = useAppSelector((state) => state.ui);
  const { goBack, goToSystems, goToSystemDetail } = useAppNavigation();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [relatedRecords, setRelatedRecords] = useState<{ dailyLogs: number; inspections: number; incidents: number } | null>(null);
  const [showForceDelete, setShowForceDelete] = useState(false);
  const [isMonitoringPointFormOpen, setIsMonitoringPointFormOpen] = useState(false);
  const [editingMonitoringPoint, setEditingMonitoringPoint] = useState<MonitoringPoint | null>(null);
  const [deletingMonitoringPoint, setDeletingMonitoringPoint] = useState<MonitoringPoint | null>(null);
  const [isDeleteMonitoringPointOpen, setIsDeleteMonitoringPointOpen] = useState(false);
  const [isChecklistItemFormOpen, setIsChecklistItemFormOpen] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<ChecklistItem | null>(null);
  const [deletingChecklistItem, setDeletingChecklistItem] = useState<ChecklistItem | null>(null);
  const [isDeleteChecklistItemOpen, setIsDeleteChecklistItemOpen] = useState(false);

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(SYSTEMS_DETAIL_TOUR);

  useEffect(() => {
    if (id) {
      dispatch(fetchSystemById(Number(id)));
      dispatch(fetchMonitoringPoints({ systemId: Number(id) }));
      dispatch(fetchChecklistItemsBySystem(Number(id)));
    }
  }, [dispatch, id]);

  const handleDeleteSystem = async (force: boolean = false) => {
    if (id) {
      setDeleteError(null);
      const result = await dispatch(deleteSystem({ id: Number(id), force }));
      if (deleteSystem.fulfilled.match(result)) {
        goToSystems();
      } else if (deleteSystem.rejected.match(result)) {
        const payload = result.payload as { message: string; relatedRecords?: { dailyLogs: number; inspections: number; incidents: number } };
        setDeleteError(payload.message || t('systems.deleteFailed'));

        // If there are related records, show force delete option
        if (payload.relatedRecords && !force) {
          setRelatedRecords(payload.relatedRecords);
          setShowForceDelete(true);
        }
      }
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteOpen(false);
    setDeleteError(null);
    setRelatedRecords(null);
    setShowForceDelete(false);
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

  const handleOpenChecklistItemForm = (item?: ChecklistItem) => {
    if (item) {
      setEditingChecklistItem(item);
    } else {
      setEditingChecklistItem(null);
    }
    setIsChecklistItemFormOpen(true);
  };

  const handleCloseChecklistItemForm = () => {
    setIsChecklistItemFormOpen(false);
    setEditingChecklistItem(null);
  };

  const handleOpenDeleteChecklistItem = (item: ChecklistItem) => {
    setDeletingChecklistItem(item);
    setIsDeleteChecklistItemOpen(true);
  };

  const handleDeleteChecklistItem = async () => {
    if (deletingChecklistItem) {
      const result = await dispatch(deleteChecklistItemAction(deletingChecklistItem.id));
      if (deleteChecklistItemAction.fulfilled.match(result)) {
        setIsDeleteChecklistItemOpen(false);
        setDeletingChecklistItem(null);
      }
    }
  };

  const monitoringPointColumns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (point: MonitoringPoint) => (
        <span className="font-medium text-gray-900">{point.name}</span>
      )
    },
    {
      key: 'parameter',
      header: t('monitoringPoints.parameter'),
      render: (point: MonitoringPoint) => point.parameterObj?.name || '-'
    },
    {
      key: 'unit',
      header: t('monitoringPoints.unit'),
      render: (point: MonitoringPoint) => (
        <span className={!point.unitObj ? 'text-gray-400' : ''}>
          {point.unitObj?.abbreviation || 'N/A'}
        </span>
      )
    },
    {
      key: 'range',
      header: t('monitoringPoints.range'),
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
      header: t('monitoringPoints.alerts'),
      render: (point: MonitoringPoint) => (
        <Badge variant={point.alertEnabled ? 'primary' : 'secondary'}>
          {point.alertEnabled ? t('monitoringPoints.enabled') : t('monitoringPoints.disabled')}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (point: MonitoringPoint) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenMonitoringPointForm(point)}>
            {t('common.edit')}
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleOpenDeleteMonitoringPoint(point)}>
            {t('common.delete')}
          </Button>
        </div>
      )
    }
  ];

  const checklistItemColumns = [
    {
      key: 'name',
      header: t('common.name'),
      render: (item: ChecklistItem) => (
        <span className="font-medium text-gray-900">{item.name}</span>
      )
    },
    {
      key: 'description',
      header: t('common.description'),
      render: (item: ChecklistItem) => (
        <span className="text-gray-600">{item.description || '-'}</span>
      )
    },
    {
      key: 'isRequired',
      header: t('common.required'),
      render: (item: ChecklistItem) => (
        <Badge variant={item.isRequired ? 'warning' : 'secondary'}>
          {item.isRequired ? t('common.required') : t('common.optional')}
        </Badge>
      )
    },
    {
      key: 'order',
      header: t('checklistItems.displayOrder'),
      render: (item: ChecklistItem) => item.order
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: ChecklistItem) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleOpenChecklistItemForm(item)}>
            {t('common.edit')}
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleOpenDeleteChecklistItem(item)}>
            {t('common.delete')}
          </Button>
        </div>
      )
    }
  ];

  if (!currentSystem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('common.loading')}</p>
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
          <div data-tour="detail-header">
            <h1 className="text-2xl font-bold text-gray-900">{currentSystem.name}</h1>
            <p className="text-gray-500 mt-1">{currentSystem.systemType?.name || '-'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div data-tour="action-buttons" className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              {t('common.edit')}
            </Button>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
              {t('common.delete')}
            </Button>
          </div>
          <Tooltip title={t('common.help')} placement="bottom">
            <IconButton onClick={() => startTour(SYSTEMS_DETAIL_TOUR)} size="small">
              <HelpOutline />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-tour="system-info">
          <Card title={t('systems.systemDetails')} className="lg:col-span-1">
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('common.status')}</dt>
                <dd className="mt-1">
                  <Badge variant={currentSystem.status === 'active' ? 'success' : 'secondary'}>
                    {currentSystem.status === 'active' ? t('systems.active') : currentSystem.status === 'inactive' ? t('systems.inactive') : t('systems.maintenance')}
                  </Badge>
                </dd>
              </div>
              {currentSystem.parent && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('systems.parentSystem')}</dt>
                  <dd className="mt-1 text-gray-900">
                    <button
                      onClick={() => goToSystemDetail(currentSystem.parent!.id)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      {currentSystem.parent.name} ({currentSystem.parent.systemType?.name || '-'})
                    </button>
                  </dd>
                </div>
              )}
              {currentSystem.children && currentSystem.children.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('systems.subSystems')}</dt>
                  <dd className="mt-1">
                    <ul className="space-y-1">
                      {currentSystem.children.map(child => (
                        <li key={child.id}>
                          <button
                            onClick={() => goToSystemDetail(child.id)}
                            className="text-blue-600 hover:text-blue-800 underline text-sm"
                          >
                            {child.name} ({child.systemType?.name || '-'})
                          </button>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('common.location')}</dt>
                <dd className="mt-1 text-gray-900">{currentSystem.location || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('common.description')}</dt>
                <dd className="mt-1 text-gray-900">{currentSystem.description || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('systems.createdAt')}</dt>
                <dd className="mt-1 text-gray-900">
                  {new Date(currentSystem.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        <div data-tour="photo-gallery">
          <PhotoGallery systemId={currentSystem.id} systemName={currentSystem.name} className="lg:col-span-2" />
        </div>
      </div>

      <div data-tour="monitoring-points-section">
        <Card
          title={t('systems.monitoringPoints')}
          noPadding
          headerActions={
            <div data-tour="add-monitoring-point">
              <Button variant="primary" size="sm" onClick={() => handleOpenMonitoringPointForm()}>
                {t('systems.addPoint')}
              </Button>
            </div>
          }
        >
          <div data-tour="monitoring-points-table">
            <Table
              columns={monitoringPointColumns}
              data={monitoringPoints}
              keyExtractor={(point) => point.id}
              emptyMessage={t('monitoringPoints.noMonitoringPoints')}
            />
          </div>
        </Card>
      </div>

      <div data-tour="checklist-section">
        <Card
          title={t('systems.checklistItems')}
          noPadding
          headerActions={
            <div data-tour="add-checklist-item">
              <Button variant="primary" size="sm" onClick={() => handleOpenChecklistItemForm()}>
                {t('systems.addItem')}
              </Button>
            </div>
          }
        >
          <div data-tour="checklist-table">
            <Table
              columns={checklistItemColumns}
              data={checklistItems}
              keyExtractor={(item) => item.id}
              emptyMessage={t('checklistItems.noChecklistItems')}
            />
          </div>
        </Card>
      </div>

      <SystemForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        system={currentSystem}
      />

      <Modal isOpen={isDeleteOpen} onClose={handleCloseDeleteModal} title={t('systems.deleteSystem')} size="sm">
        {deleteError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {deleteError}
          </div>
        )}
        {currentSystem?.children && currentSystem.children.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
            <p className="font-semibold">{t('systems.deleteWarning')}</p>
            <p className="text-sm mt-1">{t('systems.deleteSubSystemsFirst', { count: currentSystem.children.length })}</p>
          </div>
        )}
        {showForceDelete && relatedRecords && (
          <div className="bg-orange-50 border border-orange-300 text-orange-900 px-4 py-3 rounded mb-4">
            <p className="font-semibold mb-2">{t('systems.forceDeleteWarning')}</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              {relatedRecords.dailyLogs > 0 && (
                <li>{t('systems.forceDeleteDailyLogs', { count: relatedRecords.dailyLogs })}</li>
              )}
              {relatedRecords.inspections > 0 && (
                <li>{t('systems.forceDeleteInspections', { count: relatedRecords.inspections })}</li>
              )}
              {relatedRecords.incidents > 0 && (
                <li>{t('systems.forceDeleteIncidents', { count: relatedRecords.incidents })}</li>
              )}
            </ul>
          </div>
        )}
        <p className="text-gray-600 mb-6">
          {showForceDelete ? t('systems.forceDeleteConfirm') : t('systems.deleteConfirm')}
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleCloseDeleteModal} disabled={loading}>
            {t('common.cancel')}
          </Button>
          {showForceDelete ? (
            <Button
              variant="danger"
              onClick={() => handleDeleteSystem(true)}
              disabled={loading}
            >
              {loading ? t('common.loading') : t('systems.forceDeleteButton')}
            </Button>
          ) : (
            <Button
              variant="danger"
              onClick={() => handleDeleteSystem(false)}
              disabled={loading || (currentSystem?.children && currentSystem.children.length > 0)}
            >
              {loading ? t('common.loading') : t('common.delete')}
            </Button>
          )}
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
        title={t('monitoringPoints.deleteMonitoringPoint')}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          {t('monitoringPoints.deleteConfirm')}
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteMonitoringPointOpen(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteMonitoringPoint} disabled={loading}>
            {loading ? t('common.loading') : t('common.delete')}
          </Button>
        </div>
      </Modal>

      <ChecklistItemForm
        isOpen={isChecklistItemFormOpen}
        onClose={handleCloseChecklistItemForm}
        systemId={Number(id)}
        checklistItem={editingChecklistItem}
      />

      <Modal
        isOpen={isDeleteChecklistItemOpen}
        onClose={() => setIsDeleteChecklistItemOpen(false)}
        title={t('checklistItems.deleteChecklistItem')}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          {t('checklistItems.deleteConfirm')}
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteChecklistItemOpen(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDeleteChecklistItem} disabled={loading}>
            {loading ? t('common.loading') : t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SystemDetailPage;
