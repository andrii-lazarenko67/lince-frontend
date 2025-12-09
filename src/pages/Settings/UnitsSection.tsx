import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  clearError
} from '../../store/slices/unitSlice';
import { Card, Button, Table, Modal, Input, Badge } from '../../components/common';
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '../../types/unit.types';

const UnitsSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { units, loading, error } = useAppSelector((state) => state.units);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState<CreateUnitRequest>({
    name: '',
    abbreviation: '',
    category: ''
  });

  const canManage = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchUnits());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenCreate = () => {
    setSelectedUnit(null);
    setFormData({ name: '', abbreviation: '', category: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setFormData({
      name: unit.name,
      abbreviation: unit.abbreviation,
      category: unit.category || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.abbreviation.trim()) {
      alert(t('settings.units.validationRequired'));
      return;
    }

    let result;
    if (selectedUnit) {
      result = await dispatch(updateUnit({
        id: selectedUnit.id,
        data: formData as UpdateUnitRequest
      }));
    } else {
      result = await dispatch(createUnit(formData));
    }

    if (createUnit.fulfilled.match(result) || updateUnit.fulfilled.match(result)) {
      setIsModalOpen(false);
      setSelectedUnit(null);
      dispatch(fetchUnits());
    }
  };

  const handleDelete = async () => {
    if (selectedUnit) {
      const result = await dispatch(deleteUnit(selectedUnit.id));
      if (deleteUnit.fulfilled.match(result)) {
        setIsDeleteOpen(false);
        setSelectedUnit(null);
        dispatch(fetchUnits());
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: t('settings.units.name'),
      render: (unit: Unit) => <span className="font-medium">{unit.name}</span>
    },
    {
      key: 'abbreviation',
      header: t('settings.units.abbreviation'),
      render: (unit: Unit) => <code className="bg-gray-100 px-2 py-1 rounded">{unit.abbreviation}</code>
    },
    {
      key: 'category',
      header: t('settings.units.category'),
      render: (unit: Unit) => unit.category || '-'
    },
    {
      key: 'type',
      header: t('settings.units.type'),
      render: (unit: Unit) => (
        <Badge variant={unit.isSystemDefault ? 'info' : 'success'}>
          {unit.isSystemDefault ? t('settings.units.systemDefault') : t('settings.units.custom')}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('settings.units.actions'),
      render: (unit: Unit) => (
        <div className="flex space-x-2">
          {canManage && (
            <>
              <button
                onClick={() => handleOpenEdit(unit)}
                className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={unit.isSystemDefault}
              >
                {t('common.edit')}
              </button>
              <button
                onClick={() => handleOpenDelete(unit)}
                className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={unit.isSystemDefault}
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
        title={t('settings.units.title')}
        subtitle={t('settings.units.subtitle')}
        noPadding
        headerActions={
          canManage ? (
            <Button variant="primary" onClick={handleOpenCreate}>
              {t('settings.units.addUnit')}
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
            data={units}
            keyExtractor={(unit) => unit.id}
            emptyMessage={t('settings.units.emptyMessage')}
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUnit(null);
        }}
        title={selectedUnit ? t('settings.units.editUnit') : t('settings.units.addUnit')}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={t('settings.units.unitName')}
            placeholder={t('settings.units.namePlaceholder')}
            required
          />

          <Input
            name="abbreviation"
            value={formData.abbreviation}
            onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
            label={t('settings.units.abbreviationLabel')}
            placeholder={t('settings.units.abbreviationPlaceholder')}
            required
          />

          <Input
            name="category"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            label={t('settings.units.categoryOptional')}
            placeholder={t('settings.units.categoryPlaceholder')}
          />

          <div className="flex justify-end space-x-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedUnit(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {selectedUnit ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedUnit(null);
        }}
        title={t('settings.units.deleteUnit')}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          {t('settings.units.deleteConfirm', {
            name: selectedUnit?.name,
            abbreviation: selectedUnit?.abbreviation
          })}
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedUnit(null);
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

export default UnitsSection;
