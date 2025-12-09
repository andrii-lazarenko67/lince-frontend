import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchProductById, fetchProductUsageHistory, recordProductUsage, updateStock, deleteProduct } from '../../store/slices/productSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Badge, Button, Modal, Input, Select, TextArea, Table } from '../../components/common';
import ProductDosageSection from '../../components/ProductDosageSection';
import type { ProductUsage } from '../../types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentProduct, usages } = useAppSelector((state) => state.products);
  const { systems } = useAppSelector((state) => state.systems);
  const { loading } = useAppSelector((state) => state.ui);
  const { goBack, goToProducts } = useAppNavigation();

  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [usageData, setUsageData] = useState({
    systemId: '',
    quantity: '',
    type: 'out' as 'in' | 'out',
    notes: ''
  });

  const [stockData, setStockData] = useState({
    quantity: '',
    type: 'add',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(Number(id)));
      dispatch(fetchProductUsageHistory({ id: Number(id) }));
    }
    dispatch(fetchSystems({}));
  }, [dispatch, id]);

  const handleRecordUsage = async () => {
    if (id && usageData.quantity) {
      const result = await dispatch(recordProductUsage({
        id: Number(id),
        data: {
          systemId: usageData.systemId ? Number(usageData.systemId) : undefined,
          quantity: parseFloat(usageData.quantity),
          type: usageData.type,
          notes: usageData.notes || undefined
        }
      }));
      if (recordProductUsage.fulfilled.match(result)) {
        setIsUsageOpen(false);
        setUsageData({ systemId: '', quantity: '', type: 'out', notes: '' });
        // Refresh product and usage history to show changes immediately
        dispatch(fetchProductById(Number(id)));
        dispatch(fetchProductUsageHistory({ id: Number(id) }));
      }
    }
  };

  const handleUpdateStock = async () => {
    if (id && stockData.quantity) {
      const result = await dispatch(updateStock({
        id: Number(id),
        quantity: parseFloat(stockData.quantity),
        type: stockData.type as 'add' | 'remove',
        notes: stockData.notes || undefined
      }));
      if (updateStock.fulfilled.match(result)) {
        setIsStockOpen(false);
        setStockData({ quantity: '', type: 'add', notes: '' });
        // Refresh product and usage history to show changes immediately
        dispatch(fetchProductById(Number(id)));
        dispatch(fetchProductUsageHistory({ id: Number(id) }));
      }
    }
  };

  const handleDelete = async () => {
    if (id) {
      const result = await dispatch(deleteProduct(Number(id)));
      if (deleteProduct.fulfilled.match(result)) {
        goToProducts();
      }
    }
  };

  const isLowStock = () => {
    if (!currentProduct?.minStockAlert) return false;
    return parseFloat(currentProduct.currentStock.toString()) <= parseFloat(currentProduct.minStockAlert.toString());
  };

  const usageColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (usage: ProductUsage) => new Date(usage.date || usage.createdAt).toLocaleDateString()
    },
    {
      key: 'type',
      header: 'Type',
      render: (usage: ProductUsage) => (
        <Badge variant={usage.type === 'in' ? 'success' : 'warning'}>
          {usage.type === 'in' ? 'Stock In' : 'Stock Out'}
        </Badge>
      )
    },
    {
      key: 'system',
      header: 'System',
      render: (usage: ProductUsage) => usage.system?.name || '-'
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (usage: ProductUsage) => `${usage.quantity} ${currentProduct?.unit || ''}`
    },
    {
      key: 'user',
      header: 'Recorded By',
      render: (usage: ProductUsage) => usage.user?.name || '-'
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (usage: ProductUsage) => usage.notes || '-'
    }
  ];

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));
  const usageTypeOptions = [
    { value: 'out', label: 'Stock Out (Usage)' },
    { value: 'in', label: 'Stock In (Received)' }
  ];
  const stockTypeOptions = [
    { value: 'add', label: 'Add Stock' },
    { value: 'remove', label: 'Remove Stock' }
  ];

  if (!currentProduct) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading product details...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">{currentProduct.name}</h1>
            <p className="text-gray-500 mt-1">{currentProduct.type || 'Product'}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setIsStockOpen(true)}>
            Update Stock
          </Button>
          <Button variant="primary" onClick={() => setIsUsageOpen(true)}>
            Record Usage
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Product Details">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                {isLowStock() ? (
                  <Badge variant="danger">Low Stock</Badge>
                ) : (
                  <Badge variant="success">In Stock</Badge>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Stock</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {currentProduct.currentStock} {currentProduct.unit}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Min. Stock Alert</dt>
              <dd className="mt-1 text-gray-900">
                {currentProduct.minStockAlert ? `${currentProduct.minStockAlert} ${currentProduct.unit}` : 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Supplier</dt>
              <dd className="mt-1 text-gray-900">{currentProduct.supplier || '-'}</dd>
            </div>
            {currentProduct.description && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-gray-900">{currentProduct.description}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card title="Usage History" className="lg:col-span-2" noPadding>
          <Table
            columns={usageColumns}
            data={usages}
            keyExtractor={(usage) => usage.id}
            emptyMessage="No usage recorded for this product."
          />
        </Card>
      </div>

      <ProductDosageSection productId={currentProduct.id} productName={currentProduct.name} />

      <Modal isOpen={isUsageOpen} onClose={() => setIsUsageOpen(false)} title="Record Usage">
        <div className='flex flex-col gap-10'>
          <Select
            name="type"
            value={usageData.type}
            onChange={(e) => setUsageData({ ...usageData, type: e.target.value as 'in' | 'out' })}
            options={usageTypeOptions}
            label="Type"
          />
          <Select
            name="systemId"
            value={usageData.systemId}
            onChange={(e) => setUsageData({ ...usageData, systemId: e.target.value })}
            options={systemOptions}
            label="System (Optional)"
            placeholder="Select system"
          />
          <Input
            type="number"
            name="quantity"
            value={usageData.quantity}
            onChange={(e) => setUsageData({ ...usageData, quantity: e.target.value })}
            label={`Quantity (${currentProduct.unit})`}
            min={0}
            step="0.01"
            required
          />
          <TextArea
            name="notes"
            value={usageData.notes}
            onChange={(e) => setUsageData({ ...usageData, notes: e.target.value })}
            label="Notes (Optional)"
            rows={3}
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsUsageOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRecordUsage} disabled={loading}>
            {loading ? 'Recording...' : 'Record'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} title="Update Stock">
        <div className="flex flex-col gap-10">
          <Select
            name="type"
            value={stockData.type}
            onChange={(e) => setStockData({ ...stockData, type: e.target.value })}
            options={stockTypeOptions}
            label="Action"
          />
          <Input
            type="number"
            name="quantity"
            value={stockData.quantity}
            onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
            label={`Quantity (${currentProduct.unit})`}
            min={0}
            step="0.01"
          />
          <TextArea
            name="notes"
            value={stockData.notes}
            onChange={(e) => setStockData({ ...stockData, notes: e.target.value })}
            label="Notes (Optional)"
            rows={3}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsStockOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdateStock} disabled={loading}>
              {loading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Product" size="sm">
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
