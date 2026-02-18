import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchParameters,
  createParameter,
  updateParameter,
  deleteParameter,
  clearError
} from '../../store/slices/parameterSlice';
import { Card, Button, Table, Modal, Input, TextArea, Badge } from '../../components/common';
import type { Parameter, CreateParameterRequest, UpdateParameterRequest } from '../../types/parameter.types';

const ParametersSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { parameters, loading, error } = useAppSelector((state) => state.parameters);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedParam, setSelectedParam] = useState<Parameter | null>(null);
  const [formData, setFormData] = useState<CreateParameterRequest>({
    name: '',
    description: ''
  });

  const canManage = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchParameters());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenCreate = () => {
    setSelectedParam(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (param: Parameter) => {
    setSelectedParam(param);
    setFormData({
      name: param.name,
      description: param.description || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (param: Parameter) => {
    setSelectedParam(param);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(t('settings.parameters.nameRequired'));
      return;
    }

    let result;
    if (selectedParam) {
      result = await dispatch(updateParameter({
        id: selectedParam.id,
        data: formData as UpdateParameterRequest
      }));
    } else {
      result = await dispatch(createParameter(formData));
    }

    if (createParameter.fulfilled.match(result) || updateParameter.fulfilled.match(result)) {
      setIsModalOpen(false);
      setSelectedParam(null);
      dispatch(fetchParameters());
    }
  };

  const handleDelete = async () => {
    if (selectedParam) {
      const result = await dispatch(deleteParameter(selectedParam.id));
      if (deleteParameter.fulfilled.match(result)) {
        setIsDeleteOpen(false);
        setSelectedParam(null);
        dispatch(fetchParameters());
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: t('settings.parameters.name'),
      render: (param: Parameter) => <span className="font-medium">{param.name}</span>
    },
    {
      key: 'description',
      header: t('settings.parameters.description'),
      render: (param: Parameter) => param.description || '-'
    },
    {
      key: 'type',
      header: t('settings.parameters.type'),
      render: (param: Parameter) => (
        <Badge variant={param.isSystemDefault ? 'info' : 'success'}>
          {param.isSystemDefault ? t('settings.parameters.systemDefault') : t('settings.parameters.custom')}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('settings.parameters.actions'),
      render: (param: Parameter) => (
        <div className="flex space-x-2">
          {canManage && (
            <>
              <button
                onClick={() => handleOpenEdit(param)}
                className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={param.isSystemDefault}
              >
                {t('common.edit')}
              </button>
              <button
                onClick={() => handleOpenDelete(param)}
                className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={param.isSystemDefault}
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
      <div data-tour="parameters-section">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Card
          title={t('settings.parameters.title')}
          subtitle={t('settings.parameters.subtitle')}
          noPadding
          headerActions={
            canManage ? (
              <div data-tour="add-parameter-button">
                <Button variant="primary" onClick={handleOpenCreate}>
                  {t('settings.parameters.addParameter')}
                </Button>
              </div>
            ) : undefined
          }
        >
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div data-tour="parameters-table">
              <Table
                columns={columns}
                data={parameters}
                keyExtractor={(param) => param.id}
                emptyMessage={t('settings.parameters.emptyMessage')}
              />
            </div>
          )}
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedParam(null);
        }}
        title={selectedParam ? t('settings.parameters.editParameter') : t('settings.parameters.addParameter')}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={t('settings.parameters.parameterName')}
            placeholder={t('settings.parameters.namePlaceholder')}
            required
          />

          <TextArea
            name="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            label={t('settings.parameters.descriptionOptional')}
            placeholder={t('settings.parameters.descriptionPlaceholder')}
            rows={3}
          />

          <div className="flex justify-end space-x-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedParam(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {selectedParam ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedParam(null);
        }}
        title={t('settings.parameters.deleteParameter')}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          {t('settings.parameters.deleteConfirm', { name: selectedParam?.name })}
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedParam(null);
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

export default ParametersSection;
