import React, { useEffect, useState } from 'react';
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
      alert('Unit name and abbreviation are required');
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
      header: 'Name',
      render: (unit: Unit) => <span className="font-medium">{unit.name}</span>
    },
    {
      key: 'abbreviation',
      header: 'Abbreviation',
      render: (unit: Unit) => <code className="bg-gray-100 px-2 py-1 rounded">{unit.abbreviation}</code>
    },
    {
      key: 'category',
      header: 'Category',
      render: (unit: Unit) => unit.category || '-'
    },
    {
      key: 'type',
      header: 'Type',
      render: (unit: Unit) => (
        <Badge variant={unit.isSystemDefault ? 'info' : 'success'}>
          {unit.isSystemDefault ? 'System Default' : 'Custom'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (unit: Unit) => (
        <div className="flex space-x-2">
          {canManage && (
            <>
              <button
                onClick={() => handleOpenEdit(unit)}
                className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={unit.isSystemDefault}
              >
                Edit
              </button>
              <button
                onClick={() => handleOpenDelete(unit)}
                className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={unit.isSystemDefault}
              >
                Delete
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
        title="Units"
        subtitle="Manage measurement units for monitoring points"
        noPadding
        headerActions={
          canManage ? (
            <Button variant="primary" onClick={handleOpenCreate}>
              Add Unit
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
            emptyMessage="No units found. Add your first unit to get started."
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
        title={selectedUnit ? 'Edit Unit' : 'Add Unit'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label="Unit Name"
            placeholder="e.g., Degrees Celsius, Milligrams per liter"
            required
          />

          <Input
            name="abbreviation"
            value={formData.abbreviation}
            onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
            label="Abbreviation"
            placeholder="e.g., °C, mg/L, L/h"
            required
          />

          <Input
            name="category"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            label="Category (Optional)"
            placeholder="e.g., temperature, concentration, flow_rate"
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
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {selectedUnit ? 'Update' : 'Create'}
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
        title="Delete Unit"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{selectedUnit?.name} ({selectedUnit?.abbreviation})</strong>?
          This action cannot be undone and will fail if the unit is currently in use.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedUnit(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default UnitsSection;
