import type { TourConfig } from '../../types';
import { INSPECTIONS_LIST_TOUR, INSPECTIONS_NEW_TOUR, INSPECTIONS_DETAIL_TOUR } from '../../constants';

/**
 * Inspections list page tour
 * Introduces users to inspection management features
 */
export const inspectionsListTour: TourConfig = {
  id: INSPECTIONS_LIST_TOUR,
  nameKey: 'tours.inspections.list.title',
  descriptionKey: 'tours.inspections.list.description',
  category: 'operations',
  roles: ['admin', 'manager', 'operator'],
  page: '/inspections',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.inspections.list.steps.welcome.title',
      contentKey: 'tours.inspections.list.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="inspections-header"]',
      titleKey: 'tours.inspections.list.steps.header.title',
      contentKey: 'tours.inspections.list.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="view-mode"]',
      titleKey: 'tours.inspections.list.steps.viewMode.title',
      contentKey: 'tours.inspections.list.steps.viewMode.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="export-button"]',
      titleKey: 'tours.inspections.list.steps.export.title',
      contentKey: 'tours.inspections.list.steps.export.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="new-inspection-button"]',
      titleKey: 'tours.inspections.list.steps.newInspection.title',
      contentKey: 'tours.inspections.list.steps.newInspection.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="filters"]',
      titleKey: 'tours.inspections.list.steps.filters.title',
      contentKey: 'tours.inspections.list.steps.filters.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="inspections-table"]',
      titleKey: 'tours.inspections.list.steps.table.title',
      contentKey: 'tours.inspections.list.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.inspections.list.steps.complete.title',
      contentKey: 'tours.inspections.list.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * New inspection form tour
 * Guides users through creating a new inspection
 */
export const inspectionsNewTour: TourConfig = {
  id: INSPECTIONS_NEW_TOUR,
  nameKey: 'tours.inspections.new.title',
  descriptionKey: 'tours.inspections.new.description',
  category: 'operations',
  roles: ['admin', 'manager', 'operator'],
  page: '/inspections/new',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.inspections.new.steps.welcome.title',
      contentKey: 'tours.inspections.new.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="new-inspection-header"]',
      titleKey: 'tours.inspections.new.steps.header.title',
      contentKey: 'tours.inspections.new.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="action-buttons"]',
      titleKey: 'tours.inspections.new.steps.actionButtons.title',
      contentKey: 'tours.inspections.new.steps.actionButtons.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="basic-info"]',
      titleKey: 'tours.inspections.new.steps.basicInfo.title',
      contentKey: 'tours.inspections.new.steps.basicInfo.content',
      placement: 'right'
    },
    {
      target: '[data-tour="checklist-items"]',
      titleKey: 'tours.inspections.new.steps.checklistItems.title',
      contentKey: 'tours.inspections.new.steps.checklistItems.content',
      placement: 'right'
    },
    {
      target: '[data-tour="conclusion"]',
      titleKey: 'tours.inspections.new.steps.conclusion.title',
      contentKey: 'tours.inspections.new.steps.conclusion.content',
      placement: 'right'
    },
    {
      target: 'body',
      titleKey: 'tours.inspections.new.steps.complete.title',
      contentKey: 'tours.inspections.new.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Inspection detail page tour
 * Shows users how to review inspection results
 */
export const inspectionsDetailTour: TourConfig = {
  id: INSPECTIONS_DETAIL_TOUR,
  nameKey: 'tours.inspections.detail.title',
  descriptionKey: 'tours.inspections.detail.description',
  category: 'operations',
  roles: ['admin', 'manager', 'operator'],
  page: '/inspections/:id',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.inspections.detail.steps.welcome.title',
      contentKey: 'tours.inspections.detail.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="detail-header"]',
      titleKey: 'tours.inspections.detail.steps.header.title',
      contentKey: 'tours.inspections.detail.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="inspection-info"]',
      titleKey: 'tours.inspections.detail.steps.inspectionInfo.title',
      contentKey: 'tours.inspections.detail.steps.inspectionInfo.content',
      placement: 'right'
    },
    {
      target: '[data-tour="checklist-results"]',
      titleKey: 'tours.inspections.detail.steps.checklistResults.title',
      contentKey: 'tours.inspections.detail.steps.checklistResults.content',
      placement: 'left'
    },
    {
      target: 'body',
      titleKey: 'tours.inspections.detail.steps.complete.title',
      contentKey: 'tours.inspections.detail.steps.complete.content',
      disableInteraction: true
    }
  ]
};
