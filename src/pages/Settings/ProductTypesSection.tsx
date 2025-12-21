import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  fetchProductTypes,
  createProductType,
  updateProductType,
  deleteProductType,
  clearError
} from '../../store/slices/productSlice';
import { Card, Button, Table, Modal, Input } from '../../components/common';
import type { ProductType } from '../../types';

const ProductTypesSection: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { productTypes, error } = useAppSelector((state) => state.products);
  const { loading } = useAppSelector((state) => state.ui);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState<{ name: string; description: string }>({
    name: '',
    description: ''
  });

  const canManage = user?.role === 'manager' || user?.role === 'admin';

  useEffect(() => {
    dispatch(fetchProductTypes());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearError()), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleOpenCreate = () => {
    setSelectedType(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type: ProductType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      description: type.description || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (type: ProductType) => {
    setSelectedType(type);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert(t('settings.productTypes.validationRequired'));
      return;
    }

    let result;
    if (selectedType) {
      result = await dispatch(updateProductType({
        id: selectedType.id,
        data: formData
      }));
    } else {
      result = await dispatch(createProductType(formData));
    }

    if (createProductType.fulfilled.match(result) || updateProductType.fulfilled.match(result)) {
      setIsModalOpen(false);
      setSelectedType(null);
      dispatch(fetchProductTypes());
    }
  };

  const handleDelete = async () => {
    if (selectedType) {
      const result = await dispatch(deleteProductType(selectedType.id));
      if (deleteProductType.fulfilled.match(result)) {
        setIsDeleteOpen(false);
        setSelectedType(null);
        dispatch(fetchProductTypes());
      }
    }
  };

  const columns = [
    {
      key: 'name',
      header: t('settings.productTypes.name'),
      render: (type: ProductType) => <span className="font-medium">{type.name}</span>
    },
    {
      key: 'description',
      header: t('settings.productTypes.description'),
      render: (type: ProductType) => type.description || '-'
    },
    {
      key: 'actions',
      header: t('settings.productTypes.actions'),
      render: (type: ProductType) => (
        <div className="flex space-x-2">
          {canManage && (
            <>
              <button
                onClick={() => handleOpenEdit(type)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                {t('common.edit')}
              </button>
              <button
                onClick={() => handleOpenDelete(type)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                {t('common.delete')}
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
        title={t('settings.productTypes.title')}
        subtitle={t('settings.productTypes.subtitle')}
        noPadding
        headerActions={
          canManage ? (
            <Button variant="primary" onClick={handleOpenCreate}>
              {t('settings.productTypes.addType')}
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
            data={productTypes}
            keyExtractor={(type) => type.id}
            emptyMessage={t('settings.productTypes.emptyMessage')}
          />
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedType(null);
        }}
        title={selectedType ? t('settings.productTypes.editType') : t('settings.productTypes.addType')}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            label={t('settings.productTypes.typeName')}
            placeholder={t('settings.productTypes.namePlaceholder')}
            required
          />

          <Input
            name="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            label={t('settings.productTypes.descriptionOptional')}
            placeholder={t('settings.productTypes.descriptionPlaceholder')}
          />

          <div className="flex justify-end space-x-3 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedType(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {selectedType ? t('common.update') : t('common.create')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedType(null);
        }}
        title={t('settings.productTypes.deleteType')}
        size="sm"
      >
        <p className="text-gray-600 mb-6">
          {t('settings.productTypes.deleteConfirm', { name: selectedType?.name })}
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => {
              setIsDeleteOpen(false);
              setSelectedType(null);
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loading}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ProductTypesSection;
