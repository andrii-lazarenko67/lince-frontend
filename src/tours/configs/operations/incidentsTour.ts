import type { TourConfig } from '../../types';
import { INCIDENTS_LIST_TOUR, INCIDENTS_NEW_TOUR, INCIDENTS_DETAIL_TOUR } from '../../constants';

/**
 * Incidents list page tour
 * Introduces users to incident management features
 */
export const incidentsListTour: TourConfig = {
  id: INCIDENTS_LIST_TOUR,
  nameKey: 'tours.incidents.list.title',
  descriptionKey: 'tours.incidents.list.description',
  category: 'operations',
  roles: ['admin', 'manager', 'operator'],
  page: '/incidents',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.incidents.list.steps.welcome.title',
      contentKey: 'tours.incidents.list.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="incidents-header"]',
      titleKey: 'tours.incidents.list.steps.header.title',
      contentKey: 'tours.incidents.list.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="view-mode"]',
      titleKey: 'tours.incidents.list.steps.viewMode.title',
      contentKey: 'tours.incidents.list.steps.viewMode.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="export-button"]',
      titleKey: 'tours.incidents.list.steps.export.title',
      contentKey: 'tours.incidents.list.steps.export.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="report-button"]',
      titleKey: 'tours.incidents.list.steps.reportButton.title',
      contentKey: 'tours.incidents.list.steps.reportButton.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="filters"]',
      titleKey: 'tours.incidents.list.steps.filters.title',
      contentKey: 'tours.incidents.list.steps.filters.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="incidents-table"]',
      titleKey: 'tours.incidents.list.steps.table.title',
      contentKey: 'tours.incidents.list.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.incidents.list.steps.complete.title',
      contentKey: 'tours.incidents.list.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * New incident form tour
 * Guides users through reporting a new incident
 */
export const incidentsNewTour: TourConfig = {
  id: INCIDENTS_NEW_TOUR,
  nameKey: 'tours.incidents.new.title',
  descriptionKey: 'tours.incidents.new.description',
  category: 'operations',
  roles: ['admin', 'manager', 'operator'],
  page: '/incidents/new',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.incidents.new.steps.welcome.title',
      contentKey: 'tours.incidents.new.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="new-incident-header"]',
      titleKey: 'tours.incidents.new.steps.header.title',
      contentKey: 'tours.incidents.new.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="action-buttons"]',
      titleKey: 'tours.incidents.new.steps.actionButtons.title',
      contentKey: 'tours.incidents.new.steps.actionButtons.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="basic-info"]',
      titleKey: 'tours.incidents.new.steps.basicInfo.title',
      contentKey: 'tours.incidents.new.steps.basicInfo.content',
      placement: 'right'
    },
    {
      target: '[data-tour="description"]',
      titleKey: 'tours.incidents.new.steps.description.title',
      contentKey: 'tours.incidents.new.steps.description.content',
      placement: 'right'
    },
    {
      target: '[data-tour="assignment"]',
      titleKey: 'tours.incidents.new.steps.assignment.title',
      contentKey: 'tours.incidents.new.steps.assignment.content',
      placement: 'right'
    },
    {
      target: 'body',
      titleKey: 'tours.incidents.new.steps.complete.title',
      contentKey: 'tours.incidents.new.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Incident detail page tour
 * Shows users how to review incident details and track resolution
 */
export const incidentsDetailTour: TourConfig = {
  id: INCIDENTS_DETAIL_TOUR,
  nameKey: 'tours.incidents.detail.title',
  descriptionKey: 'tours.incidents.detail.description',
  category: 'operations',
  roles: ['admin', 'manager', 'operator'],
  page: '/incidents/:id',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.incidents.detail.steps.welcome.title',
      contentKey: 'tours.incidents.detail.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="detail-header"]',
      titleKey: 'tours.incidents.detail.steps.header.title',
      contentKey: 'tours.incidents.detail.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="incident-info"]',
      titleKey: 'tours.incidents.detail.steps.incidentInfo.title',
      contentKey: 'tours.incidents.detail.steps.incidentInfo.content',
      placement: 'right'
    },
    {
      target: '[data-tour="resolution"]',
      titleKey: 'tours.incidents.detail.steps.resolution.title',
      contentKey: 'tours.incidents.detail.steps.resolution.content',
      placement: 'left'
    },
    {
      target: 'body',
      titleKey: 'tours.incidents.detail.steps.complete.title',
      contentKey: 'tours.incidents.detail.steps.complete.content',
      disableInteraction: true
    }
  ]
};
