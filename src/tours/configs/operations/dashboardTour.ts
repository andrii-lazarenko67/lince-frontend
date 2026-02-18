import type { TourConfig } from '../../types';
import { DASHBOARD_TOUR } from '../../constants';

/**
 * Dashboard overview tour
 * Introduces users to the main dashboard features
 */
export const dashboardTour: TourConfig = {
  id: DASHBOARD_TOUR,
  nameKey: 'tours.dashboard.title',
  descriptionKey: 'tours.dashboard.description',
  category: 'operations',
  roles: ['admin', 'manager', 'operator'], // Available to all users
  page: '/dashboard',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.dashboard.steps.welcome.title',
      contentKey: 'tours.dashboard.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="dashboard-header"]',
      titleKey: 'tours.dashboard.steps.header.title',
      contentKey: 'tours.dashboard.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="view-mode-toggle"]',
      titleKey: 'tours.dashboard.steps.viewMode.title',
      contentKey: 'tours.dashboard.steps.viewMode.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="export-button"]',
      titleKey: 'tours.dashboard.steps.export.title',
      contentKey: 'tours.dashboard.steps.export.content',
      placement: 'bottom-end'
    },
    {
      target: '[data-tour="stats-section"]',
      titleKey: 'tours.dashboard.steps.stats.title',
      contentKey: 'tours.dashboard.steps.stats.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="recent-activity"]',
      titleKey: 'tours.dashboard.steps.recentActivity.title',
      contentKey: 'tours.dashboard.steps.recentActivity.content',
      placement: 'top'
    },
    {
      target: '[data-tour="alerts-section"]',
      titleKey: 'tours.dashboard.steps.alerts.title',
      contentKey: 'tours.dashboard.steps.alerts.content',
      placement: 'top'
    },
    {
      target: '[data-tour="sidebar"]',
      titleKey: 'tours.dashboard.steps.sidebar.title',
      contentKey: 'tours.dashboard.steps.sidebar.content',
      placement: 'right'
    },
    {
      target: 'body',
      titleKey: 'tours.dashboard.steps.complete.title',
      contentKey: 'tours.dashboard.steps.complete.content',
      disableInteraction: true
    }
  ]
};
