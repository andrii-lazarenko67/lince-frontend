import type { TourConfig } from '../../types';
import { LIBRARY_LIST_TOUR, LIBRARY_UPLOAD_TOUR } from '../../constants';

/**
 * Library list page tour
 * Guides users through document library management
 */
export const libraryListTour: TourConfig = {
  id: LIBRARY_LIST_TOUR,
  nameKey: 'tours.library.list.title',
  descriptionKey: 'tours.library.list.description',
  category: 'management',
  roles: ['admin', 'manager', 'operator'],
  page: '/library',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.library.list.steps.welcome.title',
      contentKey: 'tours.library.list.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="library-header"]',
      titleKey: 'tours.library.list.steps.header.title',
      contentKey: 'tours.library.list.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="upload-button"]',
      titleKey: 'tours.library.list.steps.upload.title',
      contentKey: 'tours.library.list.steps.upload.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="search-filters"]',
      titleKey: 'tours.library.list.steps.search.title',
      contentKey: 'tours.library.list.steps.search.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="documents-table"]',
      titleKey: 'tours.library.list.steps.table.title',
      contentKey: 'tours.library.list.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.library.list.steps.complete.title',
      contentKey: 'tours.library.list.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Document upload tour
 * Guides users through uploading a new document
 */
export const libraryUploadTour: TourConfig = {
  id: LIBRARY_UPLOAD_TOUR,
  nameKey: 'tours.library.upload.title',
  descriptionKey: 'tours.library.upload.description',
  category: 'management',
  roles: ['admin', 'manager', 'operator'],
  page: '/library',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.library.upload.steps.welcome.title',
      contentKey: 'tours.library.upload.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="upload-title"]',
      titleKey: 'tours.library.upload.steps.title.title',
      contentKey: 'tours.library.upload.steps.title.content',
      placement: 'right'
    },
    {
      target: '[data-tour="upload-category"]',
      titleKey: 'tours.library.upload.steps.category.title',
      contentKey: 'tours.library.upload.steps.category.content',
      placement: 'right'
    },
    {
      target: '[data-tour="upload-system"]',
      titleKey: 'tours.library.upload.steps.system.title',
      contentKey: 'tours.library.upload.steps.system.content',
      placement: 'right'
    },
    {
      target: '[data-tour="upload-description"]',
      titleKey: 'tours.library.upload.steps.description.title',
      contentKey: 'tours.library.upload.steps.description.content',
      placement: 'right'
    },
    {
      target: '[data-tour="upload-file"]',
      titleKey: 'tours.library.upload.steps.file.title',
      contentKey: 'tours.library.upload.steps.file.content',
      placement: 'right'
    },
    {
      target: 'body',
      titleKey: 'tours.library.upload.steps.complete.title',
      contentKey: 'tours.library.upload.steps.complete.content',
      disableInteraction: true
    }
  ]
};
