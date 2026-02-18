import type { TourConfig } from '../../types';
import { PRODUCTS_LIST_TOUR, PRODUCTS_FORM_TOUR, PRODUCTS_DETAIL_TOUR } from '../../constants';

/**
 * Products list page tour
 * Introduces users to product inventory management features
 */
export const productsListTour: TourConfig = {
  id: PRODUCTS_LIST_TOUR,
  nameKey: 'tours.products.list.title',
  descriptionKey: 'tours.products.list.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/products',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.products.list.steps.welcome.title',
      contentKey: 'tours.products.list.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="products-header"]',
      titleKey: 'tours.products.list.steps.header.title',
      contentKey: 'tours.products.list.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="view-mode"]',
      titleKey: 'tours.products.list.steps.viewMode.title',
      contentKey: 'tours.products.list.steps.viewMode.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="export-button"]',
      titleKey: 'tours.products.list.steps.export.title',
      contentKey: 'tours.products.list.steps.export.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="add-product-button"]',
      titleKey: 'tours.products.list.steps.addProduct.title',
      contentKey: 'tours.products.list.steps.addProduct.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="filters"]',
      titleKey: 'tours.products.list.steps.filters.title',
      contentKey: 'tours.products.list.steps.filters.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="products-table"]',
      titleKey: 'tours.products.list.steps.table.title',
      contentKey: 'tours.products.list.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.products.list.steps.complete.title',
      contentKey: 'tours.products.list.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Product form modal tour
 * Guides users through adding/editing products
 */
export const productsFormTour: TourConfig = {
  id: PRODUCTS_FORM_TOUR,
  nameKey: 'tours.products.form.title',
  descriptionKey: 'tours.products.form.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/products',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.products.form.steps.welcome.title',
      contentKey: 'tours.products.form.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="product-name"]',
      titleKey: 'tours.products.form.steps.name.title',
      contentKey: 'tours.products.form.steps.name.content',
      placement: 'right'
    },
    {
      target: '[data-tour="product-type"]',
      titleKey: 'tours.products.form.steps.type.title',
      contentKey: 'tours.products.form.steps.type.content',
      placement: 'right'
    },
    {
      target: '[data-tour="product-unit"]',
      titleKey: 'tours.products.form.steps.unit.title',
      contentKey: 'tours.products.form.steps.unit.content',
      placement: 'right'
    },
    {
      target: '[data-tour="stock-levels"]',
      titleKey: 'tours.products.form.steps.stock.title',
      contentKey: 'tours.products.form.steps.stock.content',
      placement: 'right'
    },
    {
      target: '[data-tour="supplier-info"]',
      titleKey: 'tours.products.form.steps.supplier.title',
      contentKey: 'tours.products.form.steps.supplier.content',
      placement: 'right'
    },
    {
      target: 'body',
      titleKey: 'tours.products.form.steps.complete.title',
      contentKey: 'tours.products.form.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Product detail page tour
 * Shows users how to manage product stock and usage
 */
export const productsDetailTour: TourConfig = {
  id: PRODUCTS_DETAIL_TOUR,
  nameKey: 'tours.products.detail.title',
  descriptionKey: 'tours.products.detail.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/products/:id',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.products.detail.steps.welcome.title',
      contentKey: 'tours.products.detail.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="detail-header"]',
      titleKey: 'tours.products.detail.steps.header.title',
      contentKey: 'tours.products.detail.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="action-buttons"]',
      titleKey: 'tours.products.detail.steps.actions.title',
      contentKey: 'tours.products.detail.steps.actions.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="product-info"]',
      titleKey: 'tours.products.detail.steps.info.title',
      contentKey: 'tours.products.detail.steps.info.content',
      placement: 'right'
    },
    {
      target: '[data-tour="usage-history"]',
      titleKey: 'tours.products.detail.steps.history.title',
      contentKey: 'tours.products.detail.steps.history.content',
      placement: 'left'
    },
    {
      target: '[data-tour="dosage-section"]',
      titleKey: 'tours.products.detail.steps.dosage.title',
      contentKey: 'tours.products.detail.steps.dosage.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.products.detail.steps.complete.title',
      contentKey: 'tours.products.detail.steps.complete.content',
      disableInteraction: true
    }
  ]
};
