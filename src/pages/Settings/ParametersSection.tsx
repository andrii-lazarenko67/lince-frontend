import React, { useEffect, useState } from 'react';
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
      alert('Parameter name is required');
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
      header: 'Name',
      render: (param: Parameter) => <span className="font-medium">{param.name}</span>
    },
    {
      key: 'description',
      header: 'Description',
      render: (param: Parameter) => param.description || '-'
    },
    {
      key: 'type',
      header: 'Type',
      render: (param: Parameter) => (
        <Badge variant={param.isSystemDefault ? 'info' : 'success'}>
          {param.isSystemDefault ? 'System Default' : 'Custom'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (param: Parameter) => (
        <div className="flex space-x-2">
          {canManage && (
            <>
              <button
                onClick={() => handleOpenEdit(param)}
                className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={param.isSystemDefault}
              >
                Edit
              </button>
              <button
                onClick={() => handleOpenDelete(param)}
                className="text-red-600 hover:text-red-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={param.isSystemDefault}
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
        title="Parameters"
        subtitle="Manage measurement parameters for monitoring points"
        noPadding
        headerActions={
          canManage ? (
            <Button variant="primary" onClick={handleOpenCreate}>
              Add Parameter
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
            data={parameters}
            keyExtractor={(param) => param.id}
            emptyMessage="No parameters found. Add your first parameter to get started."
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedParam(null);
        }}
        title={selectedParam ? 'Edit Parameter' : 'Add Parameter'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label="Parameter Name"
            placeholder="e.g., pH, Temperature, Pressure"
            required
          />

          <TextArea
            name="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            label="Description (Optional)"
            placeholder="Describe what this parameter measures"
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
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {selectedParam ? 'Update' : 'Create'}
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
        title="Delete Parameter"
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{selectedParam?.name}</strong>?
          This action cannot be undone and will fail if the parameter is currently in use.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedParam(null);
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

export default ParametersSection;
