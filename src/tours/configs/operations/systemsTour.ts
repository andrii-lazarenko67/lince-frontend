import type { TourConfig } from '../../types';
import { SYSTEMS_LIST_TOUR, SYSTEMS_DETAIL_TOUR, SYSTEMS_MONITORING_POINTS_TOUR, SYSTEMS_CHECKLIST_TOUR } from '../../constants';

/**
 * Systems list page tour
 * Introduces users to water treatment systems management
 */
export const systemsListTour: TourConfig = {
  id: SYSTEMS_LIST_TOUR,
  nameKey: 'tours.systems.list.title',
  descriptionKey: 'tours.systems.list.description',
  category: 'operations',
  roles: ['admin', 'manager'],
  page: '/systems',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.systems.list.steps.welcome.title',
      contentKey: 'tours.systems.list.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="systems-header"]',
      titleKey: 'tours.systems.list.steps.header.title',
      contentKey: 'tours.systems.list.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="view-mode"]',
      titleKey: 'tours.systems.list.steps.viewMode.title',
      contentKey: 'tours.systems.list.steps.viewMode.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="export-button"]',
      titleKey: 'tours.systems.list.steps.export.title',
      contentKey: 'tours.systems.list.steps.export.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="add-system-button"]',
      titleKey: 'tours.systems.list.steps.addSystem.title',
      contentKey: 'tours.systems.list.steps.addSystem.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="systems-table"]',
      titleKey: 'tours.systems.list.steps.table.title',
      contentKey: 'tours.systems.list.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.systems.list.steps.complete.title',
      contentKey: 'tours.systems.list.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * System detail page tour
 * Shows users how to view and manage system details
 */
export const systemsDetailTour: TourConfig = {
  id: SYSTEMS_DETAIL_TOUR,
  nameKey: 'tours.systems.detail.title',
  descriptionKey: 'tours.systems.detail.description',
  category: 'operations',
  roles: ['admin', 'manager'],
  page: '/systems/:id',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.systems.detail.steps.welcome.title',
      contentKey: 'tours.systems.detail.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="detail-header"]',
      titleKey: 'tours.systems.detail.steps.header.title',
      contentKey: 'tours.systems.detail.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="action-buttons"]',
      titleKey: 'tours.systems.detail.steps.actions.title',
      contentKey: 'tours.systems.detail.steps.actions.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="system-info"]',
      titleKey: 'tours.systems.detail.steps.info.title',
      contentKey: 'tours.systems.detail.steps.info.content',
      placement: 'right'
    },
    {
      target: '[data-tour="photo-gallery"]',
      titleKey: 'tours.systems.detail.steps.photos.title',
      contentKey: 'tours.systems.detail.steps.photos.content',
      placement: 'left'
    },
    {
      target: 'body',
      titleKey: 'tours.systems.detail.steps.complete.title',
      contentKey: 'tours.systems.detail.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Monitoring points tour
 * Guides users through managing monitoring points for systems
 */
export const systemsMonitoringPointsTour: TourConfig = {
  id: SYSTEMS_MONITORING_POINTS_TOUR,
  nameKey: 'tours.systems.monitoringPoints.title',
  descriptionKey: 'tours.systems.monitoringPoints.description',
  category: 'operations',
  roles: ['admin', 'manager'],
  page: '/systems/:id',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.systems.monitoringPoints.steps.welcome.title',
      contentKey: 'tours.systems.monitoringPoints.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="monitoring-points-section"]',
      titleKey: 'tours.systems.monitoringPoints.steps.section.title',
      contentKey: 'tours.systems.monitoringPoints.steps.section.content',
      placement: 'top'
    },
    {
      target: '[data-tour="add-monitoring-point"]',
      titleKey: 'tours.systems.monitoringPoints.steps.add.title',
      contentKey: 'tours.systems.monitoringPoints.steps.add.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="monitoring-points-table"]',
      titleKey: 'tours.systems.monitoringPoints.steps.table.title',
      contentKey: 'tours.systems.monitoringPoints.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.systems.monitoringPoints.steps.complete.title',
      contentKey: 'tours.systems.monitoringPoints.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Checklist items tour
 * Shows users how to manage inspection checklist items
 */
export const systemsChecklistTour: TourConfig = {
  id: SYSTEMS_CHECKLIST_TOUR,
  nameKey: 'tours.systems.checklist.title',
  descriptionKey: 'tours.systems.checklist.description',
  category: 'operations',
  roles: ['admin', 'manager'],
  page: '/systems/:id',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.systems.checklist.steps.welcome.title',
      contentKey: 'tours.systems.checklist.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="checklist-section"]',
      titleKey: 'tours.systems.checklist.steps.section.title',
      contentKey: 'tours.systems.checklist.steps.section.content',
      placement: 'top'
    },
    {
      target: '[data-tour="add-checklist-item"]',
      titleKey: 'tours.systems.checklist.steps.add.title',
      contentKey: 'tours.systems.checklist.steps.add.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="checklist-table"]',
      titleKey: 'tours.systems.checklist.steps.table.title',
      contentKey: 'tours.systems.checklist.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.systems.checklist.steps.complete.title',
      contentKey: 'tours.systems.checklist.steps.complete.content',
      disableInteraction: true
    }
  ]
};
