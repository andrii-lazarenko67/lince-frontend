import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchSystemTypes,
  createSystemType,
  updateSystemType,
  deleteSystemType,
  clearError
} from '../../store/slices/systemTypeSlice';
import { Card, Button, Table, Modal, Input, TextArea } from '../../components/common';
import type { SystemType, CreateSystemTypeRequest, UpdateSystemTypeRequest } from '../../types/systemType.types';

const SystemTypesSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { systemTypes, loading, error } = useAppSelector((state) => state.systemTypes);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSystemType, setSelectedSystemType] = useState<SystemType | null>(null);
  const [formData, setFormData] = useState<CreateSystemTypeRequest>({
    name: '',
    description: ''
  });

  const canManage = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchSystemTypes());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenCreate = () => {
    setSelectedSystemType(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (systemType: SystemType) => {
    setSelectedSystemType(systemType);
    setFormData({
      name: systemType.name,
      description: systemType.description || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (systemType: SystemType) => {
    setSelectedSystemType(systemType);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(t('settings.systemTypes.nameRequired'));
      return;
    }

    let result;
    if (selectedSystemType) {
      result = await dispatch(updateSystemType({
        id: selectedSystemType.id,
        data: formData as UpdateSystemTypeRequest
      }));
    } else {
      result = await dispatch(createSystemType(formData));
    }

    if (createSystemType.fulfilled.match(result) || updateSystemType.fulfilled.match(result)) {
      setIsModalOpen(false);
      setSelectedSystemType(null);
      dispatch(fetchSystemTypes());
    }
  };

  const handleDelete = async () => {
    if (selectedSystemType) {
      const result = await dispatch(deleteSystemType(selectedSystemType.id));
      if (deleteSystemType.fulfilled.match(result)) {
        setIsDeleteOpen(false);
        setSelectedSystemType(null);
        dispatch(fetchSystemTypes());
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: t('settings.systemTypes.name'),
      render: (systemType: SystemType) => <span className="font-medium">{systemType.name}</span>
    },
    {
      key: 'description',
      header: t('settings.systemTypes.description'),
      render: (systemType: SystemType) => systemType.description || '-'
    },
    {
      key: 'createdAt',
      header: t('common.createdAt'),
      render: (systemType: SystemType) => new Date(systemType.createdAt).toLocaleDateString()
    },
    {
      key: 'actions',
      header: t('settings.systemTypes.actions'),
      render: (systemType: SystemType) => (
        <div className="flex space-x-2">
          {canManage && (
            <>
              <button
                onClick={() => handleOpenEdit(systemType)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {t('common.edit')}
              </button>
              <button
                onClick={() => handleOpenDelete(systemType)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                {t('common.delete')}
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Card
        title={t('settings.systemTypes.title')}
        subtitle={t('settings.systemTypes.subtitle')}
        noPadding
        headerActions={
          canManage ? (
            <Button variant="primary" onClick={handleOpenCreate}>
              {t('settings.systemTypes.addSystemType')}
            </Button>
          ) : undefined
        }
      >
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table
            columns={columns}
            data={systemTypes}
            keyExtractor={(systemType) => systemType.id}
            emptyMessage={t('settings.systemTypes.emptyMessage')}
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSystemType(null);
        }}
        title={selectedSystemType ? t('settings.systemTypes.editSystemType') : t('settings.systemTypes.addSystemType')}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={t('settings.systemTypes.systemTypeName')}
            placeholder={t('settings.systemTypes.namePlaceholder')}
            required
          />

          <TextArea
            name="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            label={t('settings.systemTypes.descriptionOptional')}
            placeholder={t('settings.systemTypes.descriptionPlaceholder')}
            rows={3}
          />

          <div className="flex justify-end space-x-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedSystemType(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {selectedSystemType ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedSystemType(null);
        }}
        title={t('settings.systemTypes.deleteSystemType')}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          {t('settings.systemTypes.deleteConfirm', { name: selectedSystemType?.name })}
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedSystemType(null);
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default SystemTypesSection;
