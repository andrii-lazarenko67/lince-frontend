import React, { useEffect, useState } from 'react';
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
  const dispatch = useAppDispatch();
  const { dosages, loading, error } = useAppSelector((state) => state.productDosages);
  const { units } = useAppSelector((state) => state.units);
  const { systems } = useAppSelector((state) => state.systems);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDosage, setSelectedDosage] = useState<ProductDosage | null>(null);

  const [formData, setFormData] = useState<CreateProductDosageRequest>({
    productId,
    systemId: null,
    value: 0,
    unitId: 0,
    dosageMode: 'manual',
    frequency: '',
    notes: ''
  });

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
    setIsModalOpen(true);
  };

  const handleOpenDelete = (dosage: ProductDosage) => {
    setSelectedDosage(dosage);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.value || formData.value <= 0) {
      alert('Please enter a valid dosage value');
      return;
    }
    if (!formData.unitId) {
      alert('Please select a unit');
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
      header: 'Date',
      render: (dosage: ProductDosage) => new Date(dosage.recordedAt).toLocaleDateString()
    },
    {
      key: 'value',
      header: 'Dosage',
      render: (dosage: ProductDosage) => `${dosage.value} ${dosage.unit?.abbreviation || ''}`
    },
    {
      key: 'dosageMode',
      header: 'Mode',
      render: (dosage: ProductDosage) => (
        <Badge variant={dosage.dosageMode === 'automatic' ? 'info' : 'secondary'}>
          {dosage.dosageMode === 'automatic' ? 'Automatic' : 'Manual'}
        </Badge>
      )
    },
    {
      key: 'frequency',
      header: 'Frequency',
      render: (dosage: ProductDosage) => dosage.frequency || '-'
    },
    {
      key: 'system',
      header: 'System',
      render: (dosage: ProductDosage) => dosage.system?.name || '-'
    },
    {
      key: 'recorder',
      header: 'Recorded By',
      render: (dosage: ProductDosage) => dosage.recorder?.name || '-'
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (dosage: ProductDosage) => dosage.notes || '-'
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (dosage: ProductDosage) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenEdit(dosage)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleOpenDelete(dosage)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
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
    { value: '', label: 'None - General dosage' },
    ...systems.map(s => ({ value: s.id, label: s.name }))
  ];

  const dosageModeOptions: { value: DosageMode; label: string }[] = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' }
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card
        title={`Dosage History - ${productName}`}
        noPadding
        headerActions={
          <Button variant="primary" onClick={handleOpenCreate}>
            Add Dosage Record
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
            emptyMessage="No dosage records found for this product."
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedDosage ? 'Edit Dosage Record' : 'Add Dosage Record'}
      >
        <div className="flex flex-col gap-4">
          <Input
            type="number"
            name="value"
            value={formData.value.toString()}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
            label="Dosage Value"
            min={0}
            step="0.01"
            required
          />

          <Select
            name="unitId"
            value={formData.unitId.toString()}
            onChange={(e) => setFormData({ ...formData, unitId: parseInt(e.target.value) })}
            options={unitOptions}
            label="Unit"
            placeholder="Select unit"
            required
          />

          <Select
            name="dosageMode"
            value={formData.dosageMode}
            onChange={(e) => setFormData({ ...formData, dosageMode: e.target.value as DosageMode })}
            options={dosageModeOptions}
            label="Dosage Mode"
            required
          />

          <Input
            type="text"
            name="frequency"
            value={formData.frequency || ''}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
            label="Frequency (Optional)"
            placeholder="e.g., Daily, Hourly, Per batch"
          />

          <Select
            name="systemId"
            value={formData.systemId?.toString() || ''}
            onChange={(e) => setFormData({ ...formData, systemId: e.target.value ? parseInt(e.target.value) : null })}
            options={systemOptions}
            label="System (Optional)"
          />

          <TextArea
            name="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            label="Notes (Optional)"
            rows={3}
            placeholder="Additional notes about this dosage"
          />
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {selectedDosage ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedDosage(null);
        }}
        title="Delete Dosage Record"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this dosage record? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedDosage(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDosageSection;
