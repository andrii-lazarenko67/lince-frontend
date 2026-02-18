import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchProductById, fetchProductUsageHistory, recordProductUsage, updateStock, deleteProduct } from '../../store/slices/productSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Badge, Button, Modal, Input, Select, TextArea, Table } from '../../components/common';
import ProductDosageSection from '../../components/ProductDosageSection';
import type { ProductUsage } from '../../types';
import { useTour, useAutoStartTour, PRODUCTS_DETAIL_TOUR } from '../../tours';
import { HelpOutline } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

const ProductDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentProduct, usages } = useAppSelector((state) => state.products);
  const { systems } = useAppSelector((state) => state.systems);
  const { loading } = useAppSelector((state) => state.ui);
  const { goBack, goToProducts } = useAppNavigation();

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(PRODUCTS_DETAIL_TOUR);

  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [isStockOpen, setIsStockOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // System/Stage selection state for usage modal
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [selectedStageId, setSelectedStageId] = useState<string>('');

  const [usageData, setUsageData] = useState({
    systemId: '',
    quantity: '',
    type: 'out' as 'in' | 'out',
    notes: ''
  });

  // Get root systems (no parent)
  const rootSystems = systems.filter(s => !s.parentId);

  // Get stages (children of selected system)
  const stageOptions = selectedSystemId
    ? systems.filter(s => s.parentId === Number(selectedSystemId))
    : [];

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

  // Handle system change for usage modal - reset stage and update usageData
  const handleUsageSystemChange = (systemId: string) => {
    setSelectedSystemId(systemId);
    setSelectedStageId('');
    // If no stages for this system, use the system itself
    const stages = systems.filter(s => s.parentId === Number(systemId));
    if (stages.length === 0 && systemId) {
      setUsageData({ ...usageData, systemId });
    } else {
      setUsageData({ ...usageData, systemId: '' });
    }
  };

  // Handle stage change for usage modal - update usageData with the stage ID
  const handleUsageStageChange = (stageId: string) => {
    setSelectedStageId(stageId);
    if (stageId) {
      setUsageData({ ...usageData, systemId: stageId });
    } else if (selectedSystemId) {
      // If no stage selected but system is, use the system
      const stages = systems.filter(s => s.parentId === Number(selectedSystemId));
      if (stages.length === 0) {
        setUsageData({ ...usageData, systemId: selectedSystemId });
      } else {
        setUsageData({ ...usageData, systemId: '' });
      }
    } else {
      setUsageData({ ...usageData, systemId: '' });
    }
  };

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
        setSelectedSystemId('');
        setSelectedStageId('');
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
      header: t('products.detail.date'),
      render: (usage: ProductUsage) => new Date(usage.date || usage.createdAt).toLocaleDateString()
    },
    {
      key: 'type',
      header: t('products.detail.type'),
      render: (usage: ProductUsage) => (
        <Badge variant={usage.type === 'in' ? 'success' : 'warning'}>
          {usage.type === 'in' ? t('products.detail.stockIn') : t('products.detail.stockOut')}
        </Badge>
      )
    },
    {
      key: 'system',
      header: t('products.detail.system'),
      render: (usage: ProductUsage) => usage.system?.name || '-'
    },
    {
      key: 'quantity',
      header: t('products.detail.quantity'),
      render: (usage: ProductUsage) => `${usage.quantity} ${currentProduct?.unit || ''}`
    },
    {
      key: 'user',
      header: t('products.detail.recordedBy'),
      render: (usage: ProductUsage) => usage.user?.name || '-'
    },
    {
      key: 'notes',
      header: t('products.detail.notes'),
      render: (usage: ProductUsage) => usage.notes || '-'
    }
  ];

  const systemOptions = [
    { value: '', label: t('products.filters.allSystems') },
    ...rootSystems.map(s => ({ value: s.id, label: s.name }))
  ];
  const stageSelectOptions = [
    { value: '', label: t('products.filters.allStages') },
    ...stageOptions.map(s => ({ value: s.id, label: s.name }))
  ];
  const usageTypeOptions = [
    { value: 'out', label: t('products.detail.stockOutUsage') },
    { value: 'in', label: t('products.detail.stockInReceived') }
  ];
  const stockTypeOptions = [
    { value: 'add', label: t('products.detail.addStock') },
    { value: 'remove', label: t('products.detail.removeStock') }
  ];

  if (!currentProduct) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('products.detail.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={goBack} className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div data-tour="detail-header">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{currentProduct.name}</h1>
                <p className="text-gray-500 mt-1">{currentProduct.type?.name || t('products.detail.product')}</p>
              </div>
            </div>
          </div>
          <div data-tour="action-buttons">
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setIsStockOpen(true)}>
                {t('products.detail.updateStock')}
              </Button>
              <Button variant="primary" onClick={() => setIsUsageOpen(true)}>
                {t('products.detail.recordUsage')}
              </Button>
              <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
        <Tooltip title={isCompleted(PRODUCTS_DETAIL_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
          <IconButton
            onClick={() => startTour(PRODUCTS_DETAIL_TOUR)}
            sx={{
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'primary.dark'
              }
            }}
          >
            <HelpOutline />
          </IconButton>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div data-tour="product-info">
          <Card title={t('products.detail.productDetails')}>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('products.detail.status')}</dt>
                <dd className="mt-1">
                  {isLowStock() ? (
                    <Badge variant="danger">{t('products.list.lowStock')}</Badge>
                  ) : (
                    <Badge variant="success">{t('products.list.inStock')}</Badge>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('products.detail.currentStock')}</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {currentProduct.currentStock} {currentProduct.unit?.abbreviation || ''}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('products.detail.minStockAlert')}</dt>
                <dd className="mt-1 text-gray-900">
                  {currentProduct.minStockAlert ? `${currentProduct.minStockAlert} ${currentProduct.unit?.abbreviation || ''}` : t('products.detail.notSet')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{t('products.detail.supplier')}</dt>
                <dd className="mt-1 text-gray-900">{currentProduct.supplier || '-'}</dd>
              </div>
              {currentProduct.recommendedDosage && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('products.detail.recommendedDosage')}</dt>
                  <dd className="mt-1 text-gray-900">{currentProduct.recommendedDosage}</dd>
                </div>
              )}
              {currentProduct.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">{t('products.detail.description')}</dt>
                  <dd className="mt-1 text-gray-900">{currentProduct.description}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>

        <div data-tour="usage-history" className="lg:col-span-2">
          <Card title={t('products.detail.usageHistory')} noPadding>
            <Table
              columns={usageColumns}
              data={usages}
              keyExtractor={(usage) => usage.id}
              emptyMessage={t('products.detail.noUsage')}
            />
          </Card>
        </div>
      </div>

      <div data-tour="dosage-section">
        <ProductDosageSection productId={currentProduct.id} productName={currentProduct.name} />
      </div>

      <Modal isOpen={isUsageOpen} onClose={() => setIsUsageOpen(false)} title={t('products.detail.recordUsage')}>
        <div className='flex flex-col gap-4'>
          <Select
            name="type"
            value={usageData.type}
            onChange={(e) => setUsageData({ ...usageData, type: e.target.value as 'in' | 'out' })}
            options={usageTypeOptions}
            label={t('products.detail.type')}
          />
          <Select
            name="systemId"
            value={selectedSystemId}
            onChange={(e) => handleUsageSystemChange(e.target.value)}
            options={systemOptions}
            label={t('products.detail.systemOptional')}
            placeholder={t('products.detail.selectSystem')}
          />
          {selectedSystemId && stageOptions.length > 0 && (
            <Select
              name="stageId"
              value={selectedStageId}
              onChange={(e) => handleUsageStageChange(e.target.value)}
              options={stageSelectOptions}
              label={t('products.filters.stage')}
              placeholder={t('products.detail.selectSystem')}
            />
          )}
          <Input
            type="number"
            name="quantity"
            value={usageData.quantity}
            onChange={(e) => setUsageData({ ...usageData, quantity: e.target.value })}
            label={`${t('products.detail.quantity')} (${currentProduct.unit?.abbreviation || ''})`}
            min={0}
            step="0.01"
            required
          />
          <TextArea
            name="notes"
            value={usageData.notes}
            onChange={(e) => setUsageData({ ...usageData, notes: e.target.value })}
            label={t('products.detail.notesOptional')}
            rows={3}
          />
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setIsUsageOpen(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleRecordUsage} disabled={loading}>
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('products.detail.recording')}
              </span>
            ) : t('products.detail.record')}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isStockOpen} onClose={() => setIsStockOpen(false)} title={t('products.detail.updateStock')}>
        <div className="flex flex-col gap-10">
          <Select
            name="type"
            value={stockData.type}
            onChange={(e) => setStockData({ ...stockData, type: e.target.value })}
            options={stockTypeOptions}
            label={t('products.detail.action')}
          />
          <Input
            type="number"
            name="quantity"
            value={stockData.quantity}
            onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
            label={`${t('products.detail.quantity')} (${currentProduct.unit?.abbreviation || ''})`}
            min={0}
            step="0.01"
          />
          <TextArea
            name="notes"
            value={stockData.notes}
            onChange={(e) => setStockData({ ...stockData, notes: e.target.value })}
            label={t('products.detail.notesOptional')}
            rows={3}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsStockOpen(false)} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleUpdateStock} disabled={loading}>
              {loading ? t('products.detail.updating') : t('common.update')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title={t('products.detail.deleteProduct')} size="sm">
        <p className="text-gray-600 mb-6">
          {t('products.detail.deleteConfirm')}
        </p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {loading ? t('products.detail.deleting') : t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetailPage;
