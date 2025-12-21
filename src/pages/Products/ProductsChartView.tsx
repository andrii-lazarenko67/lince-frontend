import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common';
import { DonutChart, BarChart, StockLevelChart } from '../../components/charts';
import type { Product } from '../../types';

interface ProductsChartViewProps {
  products: Product[];
}

const ProductsChartView: React.FC<ProductsChartViewProps> = ({ products }) => {
  const { t } = useTranslation();
  const totalProducts = products.length;
  const lowStockCount = products.filter(p =>
    p.minStockAlert !== null && Number(p.currentStock) <= Number(p.minStockAlert)
  ).length;
  const normalStockCount = totalProducts - lowStockCount;

  // Stock status donut
  const stockStatusData = [
    { label: t('products.charts.inStock'), value: normalStockCount, color: '#22c55e' },
    { label: t('products.charts.lowStock'), value: lowStockCount, color: '#ef4444' }
  ];

  // Products by type donut
  const typeMap = new Map<string, number>();
  products.forEach(p => {
    const typeName = p.type?.name || t('products.charts.unknown');
    typeMap.set(typeName, (typeMap.get(typeName) || 0) + 1);
  });
  const typeColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#6366f1'];
  const byTypeData = Array.from(typeMap.entries()).map(([typeName, value], index) => ({
    label: typeName,
    value,
    color: typeColors[index % typeColors.length]
  }));

  // Stock levels chart
  const stockLevelData = products.map(p => ({
    label: p.name,
    current: Number(p.currentStock),
    min: p.minStockAlert !== null ? Number(p.minStockAlert) : null,
    unit: p.unit?.abbreviation || ''
  })).sort((a, b) => a.current - b.current);

  // Products by supplier
  const supplierMap = new Map<string, number>();
  products.forEach(p => {
    const supplier = p.supplier || t('products.charts.unknown');
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
    const typeName = p.type?.name || t('products.charts.unknown');
    typeStockMap.set(typeName, (typeStockMap.get(typeName) || 0) + Number(p.currentStock));
  });
  const stockByTypeData = Array.from(typeStockMap.entries())
    .map(([typeName, value], index) => ({
      label: typeName,
      value: Math.round(value),
      color: typeColors[index % typeColors.length]
    }))
    .sort((a, b) => b.value - a.value);

  const totalStock = products.reduce((sum, p) => sum + Number(p.currentStock), 0);

  return (
    <div className="space-y-6">
      <Card title={t('products.charts.overview')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalProducts}</p>
            <p className="text-sm text-blue-700">{t('products.charts.totalProducts')}</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{normalStockCount}</p>
            <p className="text-sm text-green-700">{t('products.charts.inStock')}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
            <p className="text-sm text-red-700">{t('products.charts.lowStock')}</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{Math.round(totalStock)}</p>
            <p className="text-sm text-purple-700">{t('products.charts.totalQuantity')}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('products.charts.stockStatus')}>
          <div className="flex justify-center py-4">
            <DonutChart data={stockStatusData} title={t('products.charts.stockStatusTitle')} size={200} />
          </div>
        </Card>

        <Card title={t('products.charts.productsByType')}>
          <div className="flex justify-center py-4">
            <DonutChart data={byTypeData} title={t('products.charts.distributionByType')} size={200} />
          </div>
        </Card>
      </div>

      <Card title={t('products.charts.currentStockLevels')}>
        <StockLevelChart data={stockLevelData} title={t('products.charts.stockLevelsTitle')} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={t('products.charts.productsBySupplier')}>
          <BarChart data={bySupplierData} title={t('products.charts.productsPerSupplier')} height={220} />
        </Card>

        <Card title={t('products.charts.stockQuantityByType')}>
          <BarChart data={stockByTypeData} title={t('products.charts.stockQuantityPerType')} height={220} />
        </Card>
      </div>
    </div>
  );
};

export default ProductsChartView;
