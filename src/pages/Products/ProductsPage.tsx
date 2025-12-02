import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector, useAppNavigation } from '../../hooks';
import { fetchProducts, createProduct, updateProduct } from '../../store/slices/productSlice';
import { Card, Button, Table, Badge, Modal, Input, Select, ExportDropdown, ViewModeToggle } from '../../components/common';
import ProductsChartView from './ProductsChartView';
import { exportToPdf, exportToHtml, exportToCsv } from '../../utils';
import type { Product, CreateProductRequest } from '../../types';

const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.products);
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
    minStockAlert: 0
  });

  useEffect(() => {
    dispatch(fetchProducts({}));
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
        minStockAlert: product.minStockAlert ? parseFloat(product.minStockAlert.toString()) : 0
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        type: '',
        unit: '',
        supplier: '',
        currentStock: 0,
        minStockAlert: 0
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
    const headers = ['Name', 'Type', 'Current Stock', 'Unit', 'Min. Alert', 'Status', 'Supplier'];
    const rows = products.map(prod => [
      prod.name,
      prod.type || '-',
      prod.currentStock,
      prod.unit,
      prod.minStockAlert || '-',
      isLowStock(prod) ? 'Low Stock' : 'In Stock',
      prod.supplier || '-'
    ]);
    return { headers, rows };
  };

  const handleExportPDF = () => {
    const { headers, rows } = getExportData();
    exportToPdf(
      {
        title: 'Products Report',
        subtitle: 'LINCE Water Treatment System',
        filename: `products-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Products', value: String(products.length) },
          { label: 'Low Stock Items', value: String(products.filter(p => isLowStock(p)).length) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      [{ title: `Products (${products.length})`, headers, rows }]
    );
  };

  const handleExportHTML = () => {
    const { headers, rows } = getExportData();
    exportToHtml(
      {
        title: 'Products Report',
        filename: `products-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Products', value: String(products.length) },
          { label: 'Low Stock Items', value: String(products.filter(p => isLowStock(p)).length) },
          { label: 'Generated', value: new Date().toLocaleString() }
        ]
      },
      [{ title: `Products (${products.length})`, headers, rows }]
    );
  };

  const handleExportCSV = () => {
    const { headers, rows } = getExportData();
    exportToCsv(
      {
        title: 'Products Report',
        filename: `products-${new Date().toISOString().split('T')[0]}`,
        metadata: [
          { label: 'Total Products', value: String(products.length) },
          { label: 'Low Stock Items', value: String(products.filter(p => isLowStock(p)).length) },
          { label: 'Generated', value: new Date().toISOString() }
        ]
      },
      [{ title: 'PRODUCTS', headers, rows }]
    );
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (product: Product) => (
        <span className="font-medium text-gray-900">{product.name}</span>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (product: Product) => product.type || '-'
    },
    {
      key: 'stock',
      header: 'Current Stock',
      render: (product: Product) => (
        <span className={isLowStock(product) ? 'text-red-600 font-medium' : ''}>
          {product.currentStock} {product.unit}
        </span>
      )
    },
    {
      key: 'minStock',
      header: 'Min. Alert',
      render: (product: Product) => product.minStockAlert ? `${product.minStockAlert} ${product.unit}` : '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (product: Product) => (
        isLowStock(product) ? (
          <Badge variant="danger">Low Stock</Badge>
        ) : (
          <Badge variant="success">In Stock</Badge>
        )
      )
    },
    {
      key: 'supplier',
      header: 'Supplier',
      render: (product: Product) => product.supplier || '-'
    }
  ];

  const typeOptions = [
    { value: 'chemical', label: 'Chemical' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'consumable', label: 'Consumable' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">Manage chemical products and inventory</p>
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
            Add Product
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
            emptyMessage="No products found. Click 'Add Product' to create one."
          />
        </Card>
      ) : (
        <ProductsChartView products={products} />
      )}

      <Modal isOpen={isFormOpen} onClose={handleCloseForm} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            label="Product Name"
            placeholder="Enter product name"
            required
          />

          <Select
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            options={typeOptions}
            label="Type"
            placeholder="Select type"
          />

          <Input
            type="text"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            label="Unit"
            placeholder="e.g., kg, L, units"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              name="currentStock"
              value={formData.currentStock ?? 0}
              onChange={handleChange}
              label="Current Stock"
              min={0}
              step="0.01"
              required
            />

            <Input
              type="number"
              name="minStockAlert"
              value={formData.minStockAlert || 0}
              onChange={handleChange}
              label="Min. Stock Alert"
              min={0}
              step="0.01"
            />
          </div>

          <Input
            type="text"
            name="supplier"
            value={formData.supplier || ''}
            onChange={handleChange}
            label="Supplier"
            placeholder="Enter supplier name"
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? 'Update' : 'Create'} Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
