import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchParameters,
  createParameter,
  updateParameter,
  deleteParameter,
  clearError as clearParameterError
} from '../../store/slices/parameterSlice';
import {
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  clearError as clearUnitError
} from '../../store/slices/unitSlice';
import { Card, Button, Table, Modal, Input, TextArea, Badge } from '../../components/common';
import type { Parameter, CreateParameterRequest, UpdateParameterRequest } from '../../types/parameter.types';
import type { Unit, CreateUnitRequest, UpdateUnitRequest } from '../../types/unit.types';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { parameters, loading: paramLoading, error: paramError } = useAppSelector((state) => state.parameters);
  const { units, loading: unitLoading, error: unitError } = useAppSelector((state) => state.units);

  const [activeTab, setActiveTab] = useState<'parameters' | 'units'>('parameters');

  // Parameter state
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [isParamDeleteOpen, setIsParamDeleteOpen] = useState(false);
  const [selectedParam, setSelectedParam] = useState<Parameter | null>(null);
  const [paramFormData, setParamFormData] = useState<CreateParameterRequest>({
    name: '',
    description: ''
  });

  // Unit state
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [isUnitDeleteOpen, setIsUnitDeleteOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [unitFormData, setUnitFormData] = useState<CreateUnitRequest>({
    name: '',
    abbreviation: '',
    category: ''
  });

  const isManager = user?.role === 'manager';

  useEffect(() => {
    dispatch(fetchParameters());
    dispatch(fetchUnits());
  }, [dispatch]);

  useEffect(() => {
    if (paramError) {
      const timer = setTimeout(() => dispatch(clearParameterError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [paramError, dispatch]);

  useEffect(() => {
    if (unitError) {
      const timer = setTimeout(() => dispatch(clearUnitError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [unitError, dispatch]);

  // Parameter handlers
  const handleOpenParamCreate = () => {
    setSelectedParam(null);
    setParamFormData({ name: '', description: '' });
    setIsParamModalOpen(true);
  };

  const handleOpenParamEdit = (param: Parameter) => {
    setSelectedParam(param);
    setParamFormData({
      name: param.name,
      description: param.description || ''
    });
    setIsParamModalOpen(true);
  };

  const handleOpenParamDelete = (param: Parameter) => {
    setSelectedParam(param);
    setIsParamDeleteOpen(true);
  };

  const handleParamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paramFormData.name.trim()) {
      alert('Parameter name is required');
      return;
    }

    let result;
    if (selectedParam) {
      result = await dispatch(updateParameter({
        id: selectedParam.id,
        data: paramFormData as UpdateParameterRequest
      }));
    } else {
      result = await dispatch(createParameter(paramFormData));
    }

    if (createParameter.fulfilled.match(result) || updateParameter.fulfilled.match(result)) {
      setIsParamModalOpen(false);
      setSelectedParam(null);
      dispatch(fetchParameters());
    }
  };

  const handleParamDelete = async () => {
    if (selectedParam) {
      const result = await dispatch(deleteParameter(selectedParam.id));
      if (deleteParameter.fulfilled.match(result)) {
        setIsParamDeleteOpen(false);
        setSelectedParam(null);
        dispatch(fetchParameters());
      }
    }
  };

  // Unit handlers
  const handleOpenUnitCreate = () => {
    setSelectedUnit(null);
    setUnitFormData({ name: '', abbreviation: '', category: '' });
    setIsUnitModalOpen(true);
  };

  const handleOpenUnitEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setUnitFormData({
      name: unit.name,
      abbreviation: unit.abbreviation,
      category: unit.category || ''
    });
    setIsUnitModalOpen(true);
  };

  const handleOpenUnitDelete = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsUnitDeleteOpen(true);
  };

  const handleUnitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitFormData.name.trim() || !unitFormData.abbreviation.trim()) {
      alert('Unit name and abbreviation are required');
      return;
    }

    let result;
    if (selectedUnit) {
      result = await dispatch(updateUnit({
        id: selectedUnit.id,
        data: unitFormData as UpdateUnitRequest
      }));
    } else {
      result = await dispatch(createUnit(unitFormData));
    }

    if (createUnit.fulfilled.match(result) || updateUnit.fulfilled.match(result)) {
      setIsUnitModalOpen(false);
      setSelectedUnit(null);
      dispatch(fetchUnits());
    }
  };

  const handleUnitDelete = async () => {
    if (selectedUnit) {
      const result = await dispatch(deleteUnit(selectedUnit.id));
      if (deleteUnit.fulfilled.match(result)) {
        setIsUnitDeleteOpen(false);
        setSelectedUnit(null);
        dispatch(fetchUnits());
      }
    }
  };

  // Table columns
  const parameterColumns = [
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
          {isManager && (
            <>
              <button
                onClick={() => handleOpenParamEdit(param)}
                className="text-blue-600 hover:text-blue-800 text-sm"
                disabled={param.isSystemDefault}
              >
                Edit
              </button>
              <button
                onClick={() => handleOpenParamDelete(param)}
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

  const unitColumns = [
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
          {isManager && (
            <>
              <button
                onClick={() => handleOpenUnitEdit(unit)}
                className="text-blue-600 hover:text-blue-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                disabled={unit.isSystemDefault}
              >
                Edit
              </button>
              <button
                onClick={() => handleOpenUnitDelete(unit)}
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">System configuration and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`${
              activeTab === 'parameters'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Parameters
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`${
              activeTab === 'units'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Units
          </button>
        </nav>
      </div>

      {/* Error messages */}
      {paramError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {paramError}
        </div>
      )}
      {unitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {unitError}
        </div>
      )}

      {/* Parameters Tab */}
      {activeTab === 'parameters' && (
        <Card
          title="Parameters"
          noPadding
          headerActions={
            isManager ? (
              <Button variant="primary" onClick={handleOpenParamCreate}>
                Add Parameter
              </Button>
            ) : undefined
          }
        >
          <Table
            columns={parameterColumns}
            data={parameters}
            keyExtractor={(param) => param.id}
            emptyMessage="No parameters found. Add your first parameter to get started."
          />
        </Card>
      )}

      {/* Units Tab */}
      {activeTab === 'units' && (
        <Card
          title="Units"
          noPadding
          headerActions={
            isManager ? (
              <Button variant="primary" onClick={handleOpenUnitCreate}>
                Add Unit
              </Button>
            ) : undefined
          }
        >
          <Table
            columns={unitColumns}
            data={units}
            keyExtractor={(unit) => unit.id}
            emptyMessage="No units found. Add your first unit to get started."
          />
        </Card>
      )}

      {/* Parameter Modal */}
      <Modal
        isOpen={isParamModalOpen}
        onClose={() => {
          setIsParamModalOpen(false);
          setSelectedParam(null);
        }}
        title={selectedParam ? 'Edit Parameter' : 'Add Parameter'}
      >
        <form onSubmit={handleParamSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            value={paramFormData.name}
            onChange={(e) => setParamFormData({ ...paramFormData, name: e.target.value })}
            label="Parameter Name"
            placeholder="e.g., pH, Temperature, Pressure"
            required
          />

          <TextArea
            name="description"
            value={paramFormData.description || ''}
            onChange={(e) => setParamFormData({ ...paramFormData, description: e.target.value })}
            label="Description (Optional)"
            placeholder="Describe what this parameter measures"
            rows={3}
          />

          <div className="flex justify-end space-x-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsParamModalOpen(false);
                setSelectedParam(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={paramLoading}>
              {selectedParam ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Parameter Delete Modal */}
      <Modal
        isOpen={isParamDeleteOpen}
        onClose={() => {
          setIsParamDeleteOpen(false);
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
              setIsParamDeleteOpen(false);
              setSelectedParam(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleParamDelete} disabled={paramLoading}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* Unit Modal */}
      <Modal
        isOpen={isUnitModalOpen}
        onClose={() => {
          setIsUnitModalOpen(false);
          setSelectedUnit(null);
        }}
        title={selectedUnit ? 'Edit Unit' : 'Add Unit'}
      >
        <form onSubmit={handleUnitSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            value={unitFormData.name}
            onChange={(e) => setUnitFormData({ ...unitFormData, name: e.target.value })}
            label="Unit Name"
            placeholder="e.g., Degrees Celsius, Milligrams per liter"
            required
          />

          <Input
            name="abbreviation"
            value={unitFormData.abbreviation}
            onChange={(e) => setUnitFormData({ ...unitFormData, abbreviation: e.target.value })}
            label="Abbreviation"
            placeholder="e.g., °C, mg/L, L/h"
            required
          />

          <Input
            name="category"
            value={unitFormData.category || ''}
            onChange={(e) => setUnitFormData({ ...unitFormData, category: e.target.value })}
            label="Category (Optional)"
            placeholder="e.g., temperature, concentration, flow_rate"
          />

          <div className="flex justify-end space-x-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsUnitModalOpen(false);
                setSelectedUnit(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={unitLoading}>
              {selectedUnit ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Unit Delete Modal */}
      <Modal
        isOpen={isUnitDeleteOpen}
        onClose={() => {
          setIsUnitDeleteOpen(false);
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
              setIsUnitDeleteOpen(false);
              setSelectedUnit(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleUnitDelete} disabled={unitLoading}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
