import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation, usePagination } from '../../hooks';
import { fetchProducts, fetchProductTypes, createProduct, updateProduct } from '../../store/slices/productSlice';
import { fetchUnits } from '../../store/slices/unitSlice';
import { fetchSystems } from '../../store/slices/systemSlice';
import { Card, Button, Badge, Modal, Input, Select, TextArea, ExportDropdown, ViewModeToggle, PaginatedTable } from '../../components/common';
import ProductsChartView from './ProductsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import type { Product, CreateProductRequest } from '../../types';
import { useTour, useAutoStartTour, PRODUCTS_LIST_TOUR } from '../../tours';
import { HelpOutline } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { selectedClientId } = useAppSelector((state) => state.clients);
  const { products, productTypes, pagination, loading } = useAppSelector((state) => state.products);
  const { units } = useAppSelector((state) => state.units);
  const { systems } = useAppSelector((state) => state.systems);
  const { goToProductDetail } = useAppNavigation();

  // Tour hooks
  const { start: startTour, isCompleted } = useTour();
  useAutoStartTour(PRODUCTS_LIST_TOUR);

  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState({
    systemId: '',
    stageId: '',
    typeId: '',
    lowStock: false
  });
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    typeId: undefined,
    unitId: 0,
    supplier: '',
    currentStock: 0,
    minStockAlert: 0,
    description: '',
    recommendedDosage: ''
  });

  // Use the pagination hook
  const {
    page,
    rowsPerPage,
    apiPage,
    apiLimit,
    handleChangePage,
    handleChangeRowsPerPage,
    resetPage
  } = usePagination();

  // Load products with current pagination and filters
  const loadProducts = useCallback(() => {
    dispatch(fetchProducts({
      page: apiPage,
      limit: apiLimit,
      systemId: filters.systemId ? Number(filters.systemId) : undefined,
      typeId: filters.typeId ? Number(filters.typeId) : undefined,
      lowStock: filters.lowStock || undefined
    }));
  }, [dispatch, apiPage, apiLimit, filters]);

  // Initial load and when pagination/filters change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Load related data once
  useEffect(() => {
    dispatch(fetchProductTypes());
    dispatch(fetchUnits());
    dispatch(fetchSystems({ parentId: 'null' }));
  }, [dispatch, selectedClientId]);

  const handleApplyFilters = () => {
    resetPage();
  };

  const handleClearFilters = () => {
    setFilters({ systemId: '', stageId: '', typeId: '', lowStock: false });
    resetPage();
  };

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        typeId: product.typeId || undefined,
        unitId: product.unitId,
        supplier: product.supplier || '',
        currentStock: parseFloat(product.currentStock.toString()),
        minStockAlert: product.minStockAlert ? parseFloat(product.minStockAlert.toString()) : 0,
        description: product.description || '',
        recommendedDosage: product.recommendedDosage || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        typeId: undefined,
        unitId: 0,
        supplier: '',
        currentStock: 0,
        minStockAlert: 0,
        description: '',
        recommendedDosage: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number | undefined = value;

    if (type === 'number') {
      parsedValue = parseFloat(value) || 0;
    } else if (name === 'typeId') {
      parsedValue = value ? Number(value) : undefined;
    } else if (name === 'unitId') {
      parsedValue = value ? Number(value) : 0;
    }

    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      const result = await dispatch(updateProduct({ id: editingProduct.id, data: formData }));
      if (updateProduct.fulfilled.match(result)) {
        handleCloseForm();
      }
    } else {
      const result = await dispatch(createProduct(formData));
      if (createProduct.fulfilled.match(result)) {
        handleCloseForm();
      }
    }
  };

  const isLowStock = (product: Product) => {
    return product.minStockAlert && parseFloat(product.currentStock.toString()) <= parseFloat(product.minStockAlert.toString());
  };

  const getExportData = () => {
    const headers = [t('products.export.name'), t('products.export.type'), t('products.export.currentStock'), t('products.export.unit'), t('products.export.minAlert'), t('products.export.status'), t('products.export.supplier')];
    const rows = products.map(prod => [
      prod.name,
      prod.type?.name || '-',
      prod.currentStock,
      prod.unit?.abbreviation || '-',
      prod.minStockAlert || '-',
      isLowStock(prod) ? t('products.export.lowStock') : t('products.export.inStock'),
      prod.supplier || '-'
    ]);
    return { headers, rows };
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: t('products.export.title'),
        subtitle: t('products.export.subtitle'),
        filename: `products-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('products.export.totalProducts'), value: String(products.length) },
          { label: t('products.export.lowStockItems'), value: String(products.filter(p => isLowStock(p)).length) },
          { label: t('products.export.generated'), value: new Date().toLocaleString() }
        ],
        footerText: `${t('common.exportFooter')} - ${new Date().toLocaleString()}`
      },
      [{ title: `${t('products.export.products')} (${products.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: t('products.export.title'),
        filename: `products-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('products.export.totalProducts'), value: String(products.length) },
          { label: t('products.export.lowStockItems'), value: String(products.filter(p => isLowStock(p)).length) },
          { label: t('products.export.generated'), value: new Date().toLocaleString() }
        ]
      },
      [{ title: `${t('products.export.products')} (${products.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: t('products.export.title'),
        filename: `products-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: t('products.export.totalProducts'), value: String(products.length) },
          { label: t('products.export.lowStockItems'), value: String(products.filter(p => isLowStock(p)).length) },
          { label: t('products.export.generated'), value: new Date().toISOString() }
        ]
      },
      [{ title: t('products.export.productsUpper'), headers, rows }]
    );
  };

  const columns = [
    {
      key: 'name',
      header: t('products.list.name'),
      render: (product: Product) => (
        <span className="font-medium text-gray-900">{product.name}</span>
      )
    },
    {
      key: 'type',
      header: t('products.list.type'),
      render: (product: Product) => product.type?.name || '-'
    },
    {
      key: 'stock',
      header: t('products.list.currentStock'),
      render: (product: Product) => (
        <span className={isLowStock(product) ? 'text-red-600 font-medium' : ''}>
          {product.currentStock} {product.unit?.abbreviation || ''}
        </span>
      )
    },
    {
      key: 'minStock',
      header: t('products.list.minAlert'),
      render: (product: Product) => product.minStockAlert ? `${product.minStockAlert} ${product.unit?.abbreviation || ''}` : '-'
    },
    {
      key: 'status',
      header: t('products.list.status'),
      render: (product: Product) => (
        isLowStock(product) ? (
          <Badge variant="danger">{t('products.list.lowStock')}</Badge>
        ) : (
          <Badge variant="success">{t('products.list.inStock')}</Badge>
        )
      )
    },
    {
      key: 'supplier',
      header: t('products.list.supplier'),
      render: (product: Product) => product.supplier || '-'
    }
  ];

  // Dynamic type options from database
  const typeOptions = productTypes.map(pt => ({ value: pt.id, label: pt.name }));

  const unitOptions = units.map(u => ({ value: u.id, label: `${u.name} (${u.abbreviation})` }));

  const systemOptions = systems.map(s => ({ value: s.id, label: s.name }));

  // Get stages (children) from the selected system's children array in Redux
  const selectedSystem = systems.find(s => s.id === Number(filters.systemId));
  const stageOptions = selectedSystem?.children?.map(stage => ({
    value: stage.id,
    label: stage.name
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4" data-tour="products-header">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
            <p className="text-gray-500 mt-1">{t('products.description')}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div data-tour="view-mode">
              <ViewModeToggle
                value={viewMode}
                onChange={setViewMode}
              />
            </div>
            <div data-tour="export-button">
              <ExportDropdown
                onExportPDF={handleExportPDF}
                onExportHTML={handleExportHTML}
                onExportCSV={handleExportCSV}
                disabled={products.length === 0}
              />
            </div>
            <div data-tour="add-product-button">
              <Button variant="primary" onClick={() => handleOpenForm()}>
                {t('products.addProduct')}
              </Button>
            </div>
          </div>
        </div>
        <Tooltip title={isCompleted(PRODUCTS_LIST_TOUR) ? t('tours.common.restartTour') : t('tours.common.startTour')}>
          <IconButton
            onClick={() => startTour(PRODUCTS_LIST_TOUR)}
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

      {viewMode === 'table' ? (
        <>
          <div className="bg-white rounded-lg shadow p-4" data-tour="filters">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Select
                  name="systemId"
                  value={filters.systemId}
                  onChange={(e) => setFilters({ ...filters, systemId: e.target.value, stageId: '' })}
                  options={systemOptions}
                  label={t('products.filters.system')}
                  placeholder={t('products.filters.allSystems')}
                />
              </div>

              {stageOptions.length > 0 && (
                <div>
                  <Select
                    name="stageId"
                    value={filters.stageId}
                    onChange={(e) => setFilters({ ...filters, stageId: e.target.value })}
                    options={stageOptions}
                    label={t('products.filters.stage')}
                    placeholder={t('products.filters.allStages')}
                  />
                </div>
              )}

              <div>
                <Select
                  name="typeId"
                  value={filters.typeId}
                  onChange={(e) => setFilters({ ...filters, typeId: e.target.value })}
                  options={typeOptions}
                  label={t('products.filters.type')}
                  placeholder={t('products.filters.allTypes')}
                />
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.lowStock}
                    onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t('products.filters.lowStock')}</span>
                </label>
              </div>

              <div className="flex space-x-2 items-end">
                <Button variant="primary" onClick={handleApplyFilters} className="flex-1">
                  {t('products.filters.apply')}
                </Button>
                <Button variant="outline" onClick={handleClearFilters} className="flex-1">
                  {t('products.filters.clear')}
                </Button>
              </div>
            </div>
          </div>

          <div data-tour="products-table">
            <Card noPadding>
              <PaginatedTable
              columns={columns}
              data={products}
              keyExtractor={(product: Product) => product.id}
              onRowClick={(product: Product) => goToProductDetail(product.id)}
              emptyMessage={t('products.emptyMessage')}
              loading={loading}
              pagination={pagination}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Card>
          </div>
        </>
      ) : (
        <ProductsChartView products={products} />
      )}

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingProduct ? t('products.form.editProduct') : t('products.form.addProduct')} size="lg">
        <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
          <div data-tour="product-name">
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              label={t('products.form.name')}
              placeholder={t('products.form.namePlaceholder')}
              required
            />
          </div>

          <div data-tour="product-type">
            <Select
              name="typeId"
              value={formData.typeId?.toString() || ''}
              onChange={handleChange}
              options={typeOptions}
              label={t('products.form.type')}
              placeholder={t('products.form.selectType')}
            />
          </div>

          <div data-tour="product-unit">
            <Select
              name="unitId"
              value={formData.unitId?.toString() || ''}
              onChange={handleChange}
              options={unitOptions}
              label={t('products.form.unit')}
              placeholder={t('products.form.selectUnit')}
              required
            />
          </div>

          <div data-tour="stock-levels">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                name="currentStock"
                value={formData.currentStock ?? 0}
                onChange={handleChange}
                label={t('products.form.currentStock')}
                min={0}
                step="0.01"
                required
              />

              <Input
                type="number"
                name="minStockAlert"
                value={formData.minStockAlert || 0}
                onChange={handleChange}
                label={t('products.form.minStockAlert')}
                min={0}
                step="0.01"
              />
            </div>
          </div>

          <div data-tour="supplier-info">
            <Input
              type="text"
              name="supplier"
              value={formData.supplier || ''}
              onChange={handleChange}
              label={t('products.form.supplier')}
              placeholder={t('products.form.supplierPlaceholder')}
            />

            <Input
              type="text"
              name="recommendedDosage"
              value={formData.recommendedDosage || ''}
              onChange={handleChange}
              label={t('products.form.recommendedDosage')}
              placeholder={t('products.form.recommendedDosagePlaceholder')}
              className="mt-4"
            />

            <TextArea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              label={t('products.form.description')}
              placeholder={t('products.form.descriptionPlaceholder')}
              rows={3}
              className="mt-4"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? t('common.update') : t('common.create')} {t('products.form.product')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
