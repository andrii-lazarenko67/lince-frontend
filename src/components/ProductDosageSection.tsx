import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  fetchDosagesByProduct,
  createProductDosage,
  updateProductDosage,
  deleteProductDosage,
  clearError
} from '../store/slices/productDosageSlice';
import { fetchUnits } from '../store/slices/unitSlice';
import { fetchSystems } from '../store/slices/systemSlice';
import { Card, Badge, Button, Modal, Input, Select, TextArea, Table } from './common';
import type { ProductDosage, CreateProductDosageRequest, DosageMode } from '../types/productDosage.types';

interface ProductDosageSectionProps {
  productId: number;
  productName: string;
}

const ProductDosageSection: React.FC<ProductDosageSectionProps> = ({ productId, productName }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { dosages, loading, error } = useAppSelector((state) => state.productDosages);
  const { loading: globalLoading } = useAppSelector((state) => state.ui);
  const { units } = useAppSelector((state) => state.units);
  const { systems } = useAppSelector((state) => state.systems);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDosage, setSelectedDosage] = useState<ProductDosage | null>(null);

  // System/Stage selection state
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');

  const [formData, setFormData] = useState<CreateProductDosageRequest>({
    productId,
    systemId: null,
    value: 0,
    unitId: 0,
    dosageMode: 'manual',
    frequency: '',
    notes: ''
  });

  // Get root systems (no parent)
  const rootSystems = systems.filter(s => !s.parentId);

  // Get stages (children of selected system)
  const stageOptions = selectedSystemId
    ? systems.filter(s => s.parentId === Number(selectedSystemId))
    : [];

  useEffect(() => {
    dispatch(fetchDosagesByProduct(productId));
    dispatch(fetchUnits());
    dispatch(fetchSystems({}));
  }, [dispatch, productId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const resetForm = () => {
    setFormData({
      productId,
      systemId: null,
      value: 0,
      unitId: 0,
      dosageMode: 'manual',
      frequency: '',
      notes: ''
    });
    setSelectedDosage(null);
    setSelectedSystemId('');
    setSelectedStageId('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dosage: ProductDosage) => {
    setSelectedDosage(dosage);
    setFormData({
      productId: dosage.productId,
      systemId: dosage.systemId,
      value: dosage.value,
      unitId: dosage.unitId,
      dosageMode: dosage.dosageMode,
      frequency: dosage.frequency || '',
      notes: dosage.notes || ''
    });

    // Find and set the system/stage selection
    if (dosage.systemId) {
      const system = systems.find(s => s.id === dosage.systemId);
      if (system) {
        if (system.parentId) {
          // It's a stage - set parent as system and this as stage
          setSelectedSystemId(system.parentId.toString());
          setSelectedStageId(system.id.toString());
        } else {
          // It's a root system
          setSelectedSystemId(system.id.toString());
          setSelectedStageId('');
        }
      }
    } else {
      setSelectedSystemId('');
      setSelectedStageId('');
    }

    setIsModalOpen(true);
  };

  // Handle system change - reset stage and update formData
  const handleSystemChange = (systemId: string) => {
    setSelectedSystemId(systemId);
    setSelectedStageId('');
    // If no stages for this system, use the system itself
    const stages = systems.filter(s => s.parentId === Number(systemId));
    if (stages.length === 0 && systemId) {
      setFormData({ ...formData, systemId: Number(systemId) });
    } else {
      setFormData({ ...formData, systemId: null });
    }
  };

  // Handle stage change - update formData with the stage ID
  const handleStageChange = (stageId: string) => {
    setSelectedStageId(stageId);
    if (stageId) {
      setFormData({ ...formData, systemId: Number(stageId) });
    } else if (selectedSystemId) {
      // If no stage selected but system is, use the system
      const stages = systems.filter(s => s.parentId === Number(selectedSystemId));
      if (stages.length === 0) {
        setFormData({ ...formData, systemId: Number(selectedSystemId) });
      } else {
        setFormData({ ...formData, systemId: null });
      }
    } else {
      setFormData({ ...formData, systemId: null });
    }
  };

  const handleOpenDelete = (dosage: ProductDosage) => {
    setSelectedDosage(dosage);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.value || formData.value <= 0) {
      alert(t('productDosage.validation.validValue'));
      return;
    }
    if (!formData.unitId) {
      alert(t('productDosage.validation.selectUnit'));
      return;
    }

    const payload: CreateProductDosageRequest = {
      productId: formData.productId,
      systemId: formData.systemId || null,
      value: formData.value,
      unitId: formData.unitId,
      dosageMode: formData.dosageMode,
      frequency: formData.frequency || undefined,
      notes: formData.notes || undefined
    };

    let result;
    if (selectedDosage) {
      result = await dispatch(updateProductDosage({
        id: selectedDosage.id,
        data: payload
      }));
    } else {
      result = await dispatch(createProductDosage(payload));
    }

    if (createProductDosage.fulfilled.match(result) || updateProductDosage.fulfilled.match(result)) {
      setIsModalOpen(false);
      resetForm();
      dispatch(fetchDosagesByProduct(productId));
    }
  };

  const handleDelete = async () => {
    if (selectedDosage) {
      const result = await dispatch(deleteProductDosage(selectedDosage.id));
      if (deleteProductDosage.fulfilled.match(result)) {
        setIsDeleteOpen(false);
        setSelectedDosage(null);
        dispatch(fetchDosagesByProduct(productId));
      }
    }
  };

  const dosageColumns = [
    {
      key: 'recordedAt',
      header: t('productDosage.table.date'),
      render: (dosage: ProductDosage) => new Date(dosage.recordedAt).toLocaleDateString()
    },
    {
      key: 'value',
      header: t('productDosage.table.dosage'),
      render: (dosage: ProductDosage) => `${dosage.value} ${dosage.unit?.abbreviation || ''}`
    },
    {
      key: 'dosageMode',
      header: t('productDosage.table.mode'),
      render: (dosage: ProductDosage) => (
        <Badge variant={dosage.dosageMode === 'automatic' ? 'info' : 'secondary'}>
          {dosage.dosageMode === 'automatic' ? t('productDosage.mode.automatic') : t('productDosage.mode.manual')}
        </Badge>
      )
    },
    {
      key: 'frequency',
      header: t('productDosage.table.frequency'),
      render: (dosage: ProductDosage) => dosage.frequency || '-'
    },
    {
      key: 'system',
      header: t('productDosage.table.system'),
      render: (dosage: ProductDosage) => dosage.system?.name || '-'
    },
    {
      key: 'recorder',
      header: t('productDosage.table.recordedBy'),
      render: (dosage: ProductDosage) => dosage.recorder?.name || '-'
    },
    {
      key: 'notes',
      header: t('productDosage.table.notes'),
      render: (dosage: ProductDosage) => dosage.notes || '-'
    },
    {
      key: 'actions',
      header: t('productDosage.table.actions'),
      render: (dosage: ProductDosage) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenEdit(dosage)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {t('productDosage.table.edit')}
          </button>
          <button
            onClick={() => handleOpenDelete(dosage)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            {t('productDosage.table.delete')}
          </button>
        </div>
      )
    }
  ];

  const unitOptions = units.map(u => ({
    value: u.id,
    label: `${u.name} (${u.abbreviation})`
  }));

  const systemOptions = [
    { value: '', label: t('productDosage.form.allSystems') },
    ...rootSystems.map(s => ({ value: s.id, label: s.name }))
  ];

  const stageSelectOptions = [
    { value: '', label: t('productDosage.form.allStages') },
    ...stageOptions.map(s => ({ value: s.id, label: s.name }))
  ];

  const dosageModeOptions: { value: DosageMode; label: string }[] = [
    { value: 'manual', label: t('productDosage.mode.manual') },
    { value: 'automatic', label: t('productDosage.mode.automatic') }
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card
        title={`${t('productDosage.card.title')} - ${productName}`}
        noPadding
        headerActions={
          <Button variant="primary" onClick={handleOpenCreate}>
            {t('productDosage.card.addButton')}
          </Button>
        }
      >
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <Table
            columns={dosageColumns}
            data={dosages}
            keyExtractor={(dosage) => dosage.id}
            emptyMessage={t('productDosage.card.emptyMessage')}
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedDosage ? t('productDosage.modal.editTitle') : t('productDosage.modal.addTitle')}
      >
        <div className="flex flex-col gap-4">
          <Input
            type="number"
            name="value"
            value={formData.value.toString()}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
            label={t('productDosage.form.dosageValue')}
            min={0}
            step="0.01"
            required
          />

          <Select
            name="unitId"
            value={formData.unitId.toString()}
            onChange={(e) => setFormData({ ...formData, unitId: parseInt(e.target.value) })}
            options={unitOptions}
            label={t('productDosage.form.unit')}
            placeholder={t('productDosage.form.selectUnit')}
            required
          />

          <Select
            name="dosageMode"
            value={formData.dosageMode}
            onChange={(e) => setFormData({ ...formData, dosageMode: e.target.value as DosageMode })}
            options={dosageModeOptions}
            label={t('productDosage.form.dosageMode')}
            required
          />

          <Input
            type="text"
            name="frequency"
            value={formData.frequency || ''}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            label={t('productDosage.form.frequency')}
            placeholder={t('productDosage.form.frequencyPlaceholder')}
          />

          <Select
            name="systemId"
            value={selectedSystemId}
            onChange={(e) => handleSystemChange(e.target.value)}
            options={systemOptions}
            label={t('productDosage.form.system')}
            placeholder={t('productDosage.form.selectSystem')}
          />

          {selectedSystemId && stageOptions.length > 0 && (
            <Select
              name="stageId"
              value={selectedStageId}
              onChange={(e) => handleStageChange(e.target.value)}
              options={stageSelectOptions}
              label={t('productDosage.form.stage')}
              placeholder={t('productDosage.form.selectStage')}
            />
          )}

          <TextArea
            name="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            label={t('productDosage.form.notes')}
            rows={3}
            placeholder={t('productDosage.form.notesPlaceholder')}
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
            disabled={loading || globalLoading}
          >
            {t('productDosage.modal.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading || globalLoading}>
            {(loading || globalLoading) ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {selectedDosage ? t('productDosage.modal.update') : t('productDosage.modal.create')}
              </span>
            ) : (
              selectedDosage ? t('productDosage.modal.update') : t('productDosage.modal.create')
            )}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedDosage(null);
        }}
        title={t('productDosage.delete.title')}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          {t('productDosage.delete.confirmation')}
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedDosage(null);
            }}
            disabled={loading || globalLoading}
          >
            {t('productDosage.delete.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading || globalLoading}>
            {(loading || globalLoading) ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('productDosage.delete.delete')}
              </span>
            ) : (
              t('productDosage.delete.delete')
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDosageSection;
