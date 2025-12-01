import React from 'react';
import { Card } from '../../components/common';
import { DonutChart, BarChart, StockLevelChart } from '../../components/charts';
import type { Product } from '../../types';

interface ProductsChartViewProps {
  products: Product[];
}

const ProductsChartView: React.FC<ProductsChartViewProps> = ({ products }) => {
  const totalProducts = products.length;
  const lowStockCount = products.filter(p =>
    p.minStockAlert !== null && Number(p.currentStock) <= Number(p.minStockAlert)
  ).length;
  const normalStockCount = totalProducts - lowStockCount;

  // Stock status donut
  const stockStatusData = [
    { label: 'In Stock', value: normalStockCount, color: '#22c55e' },
    { label: 'Low Stock', value: lowStockCount, color: '#ef4444' }
  ];

  // Products by type donut
  const typeMap = new Map<string, number>();
  products.forEach(p => {
    const type = p.type || 'Other';
    typeMap.set(type, (typeMap.get(type) || 0) + 1);
  });
  const typeColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];
  const byTypeData = Array.from(typeMap.entries()).map(([label, value], index) => ({
    label,
    value,
    color: typeColors[index % typeColors.length]
  }));

  // Stock levels chart
  const stockLevelData = products.map(p => ({
    label: p.name,
    current: Number(p.currentStock),
    min: p.minStockAlert !== null ? Number(p.minStockAlert) : null,
    unit: p.unit
  })).sort((a, b) => a.current - b.current);

  // Products by supplier
  const supplierMap = new Map<string, number>();
  products.forEach(p => {
    const supplier = p.supplier || 'Unknown';
    supplierMap.set(supplier, (supplierMap.get(supplier) || 0) + 1);
  });
  const bySupplierData = Array.from(supplierMap.entries())
    .map(([label, value]) => ({
      label: label.length > 12 ? label.substring(0, 12) + '...' : label,
      value,
      color: '#6366f1'
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Total stock value by type
  const typeStockMap = new Map<string, number>();
  products.forEach(p => {
    const type = p.type || 'Other';
    typeStockMap.set(type, (typeStockMap.get(type) || 0) + Number(p.currentStock));
  });
  const stockByTypeData = Array.from(typeStockMap.entries())
    .map(([label, value], index) => ({
      label,
      value: Math.round(value),
      color: typeColors[index % typeColors.length]
    }))
    .sort((a, b) => b.value - a.value);

  const totalStock = products.reduce((sum, p) => sum + Number(p.currentStock), 0);

  return (
    <div className="space-y-6">
      <Card title="Products Overview">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
            <p className="text-sm text-blue-700">Total Products</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{normalStockCount}</p>
            <p className="text-sm text-green-700">In Stock</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
            <p className="text-sm text-red-700">Low Stock</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{Math.round(totalStock)}</p>
            <p className="text-sm text-purple-700">Total Quantity</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Stock Status">
          <div className="flex justify-center py-4">
            <DonutChart data={stockStatusData} title="In Stock vs Low Stock" size={200} />
          </div>
        </Card>

        <Card title="Products by Type">
          <div className="flex justify-center py-4">
            <DonutChart data={byTypeData} title="Distribution by type" size={200} />
          </div>
        </Card>
      </div>

      <Card title="Current Stock Levels">
        <StockLevelChart data={stockLevelData} title="All products sorted by stock level" />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Products by Supplier">
          <BarChart data={bySupplierData} title="Number of products per supplier" height={220} />
        </Card>

        <Card title="Stock Quantity by Type">
          <BarChart data={stockByTypeData} title="Total stock quantity per type" height={220} />
        </Card>
      </div>
    </div>
  );
};

export default ProductsChartView;
