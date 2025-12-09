import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchProducts, createProduct, updateProduct } from '../../store/slices/productSlice';
import { fetchUnits } from '../../store/slices/unitSlice';
import { Card, Button, Table, Badge, Modal, Input, Select, TextArea, ExportDropdown, ViewModeToggle } from '../../components/common';
import ProductsChartView from './ProductsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import type { Product, CreateProductRequest } from '../../types';

const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);
  const { units } = useAppSelector((state) => state.units);
  const { goToProductDetail } = useAppNavigation();

  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    type: '',
    unit: '',
    supplier: '',
    currentStock: 0,
    minStockAlert: 0,
    description: ''
  });

  useEffect(() => {
    dispatch(fetchProducts({}));
    dispatch(fetchUnits());
  }, [dispatch]);

  const handleOpenForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        type: product.type || '',
        unit: product.unit,
        supplier: product.supplier || '',
        currentStock: parseFloat(product.currentStock.toString()),
        minStockAlert: product.minStockAlert ? parseFloat(product.minStockAlert.toString()) : 0,
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        type: '',
        unit: '',
        supplier: '',
        currentStock: 0,
        minStockAlert: 0,
        description: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
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
      prod.type || '-',
      prod.currentStock,
      prod.unit,
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
        ]
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
      render: (product: Product) => product.type || '-'
    },
    {
      key: 'stock',
      header: t('products.list.currentStock'),
      render: (product: Product) => (
        <span className={isLowStock(product) ? 'text-red-600 font-medium' : ''}>
          {product.currentStock} {product.unit}
        </span>
      )
    },
    {
      key: 'minStock',
      header: t('products.list.minAlert'),
      render: (product: Product) => product.minStockAlert ? `${product.minStockAlert} ${product.unit}` : '-'
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

  const typeOptions = [
    { value: 'chemical', label: t('products.types.chemical') },
    { value: 'equipment', label: t('products.types.equipment') },
    { value: 'consumable', label: t('products.types.consumable') },
    { value: 'other', label: t('products.types.other') }
  ];

  const unitOptions = units.map(u => ({ value: u.abbreviation, label: `${u.name} (${u.abbreviation})` }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
          <p className="text-gray-500 mt-1">{t('products.description')}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <ViewModeToggle
            value={viewMode}
            onChange={setViewMode}
          />
          <ExportDropdown
            onExportPDF={handleExportPDF}
            onExportHTML={handleExportHTML}
            onExportCSV={handleExportCSV}
            disabled={products.length === 0}
          />
          <Button variant="primary" onClick={() => handleOpenForm()}>
            {t('products.addProduct')}
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card noPadding>
          <Table
            columns={columns}
            data={products}
            keyExtractor={(product) => product.id}
            onRowClick={(product) => goToProductDetail(product.id)}
            emptyMessage={t('products.emptyMessage')}
          />
        </Card>
      ) : (
        <ProductsChartView products={products} />
      )}

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingProduct ? t('products.form.editProduct') : t('products.form.addProduct')} size="lg">
        <form onSubmit={handleSubmit} className='flex flex-col gap-10'>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            label={t('products.form.name')}
            placeholder={t('products.form.namePlaceholder')}
            required
          />

          <Select
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            options={typeOptions}
            label={t('products.form.type')}
            placeholder={t('products.form.selectType')}
          />

          <Select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            options={unitOptions}
            label={t('products.form.unit')}
            placeholder={t('products.form.selectUnit')}
            required
          />

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

          <Input
            type="text"
            name="supplier"
            value={formData.supplier || ''}
            onChange={handleChange}
            label={t('products.form.supplier')}
            placeholder={t('products.form.supplierPlaceholder')}
          />

          <TextArea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            label={t('products.form.description')}
            placeholder={t('products.form.descriptionPlaceholder')}
            rows={3}
          />

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
