import type { TourConfig } from '../../types';
import { REPORTS_GENERATOR_TOUR, REPORTS_TEMPLATES_TOUR, REPORTS_HISTORY_TOUR, REPORTS_WORKFLOW_TOUR } from '../../constants';

/**
 * Reports page overview tour
 * Introduces users to the reports module and workflow
 */
export const reportsWorkflowTour: TourConfig = {
  id: REPORTS_WORKFLOW_TOUR,
  nameKey: 'tours.reports.workflow.title',
  descriptionKey: 'tours.reports.workflow.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/reports',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.reports.workflow.steps.welcome.title',
      contentKey: 'tours.reports.workflow.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="reports-header"]',
      titleKey: 'tours.reports.workflow.steps.header.title',
      contentKey: 'tours.reports.workflow.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="reports-tabs"]',
      titleKey: 'tours.reports.workflow.steps.tabs.title',
      contentKey: 'tours.reports.workflow.steps.tabs.content',
      placement: 'bottom'
    },
    {
      target: 'body',
      titleKey: 'tours.reports.workflow.steps.complete.title',
      contentKey: 'tours.reports.workflow.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Report generator tab tour
 * Guides users through the report generation process
 */
export const reportsGeneratorTour: TourConfig = {
  id: REPORTS_GENERATOR_TOUR,
  nameKey: 'tours.reports.generator.title',
  descriptionKey: 'tours.reports.generator.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/reports',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.reports.generator.steps.welcome.title',
      contentKey: 'tours.reports.generator.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="generator-stepper"]',
      titleKey: 'tours.reports.generator.steps.stepper.title',
      contentKey: 'tours.reports.generator.steps.stepper.content',
      placement: 'right'
    },
    {
      target: '[data-tour="template-selection"]',
      titleKey: 'tours.reports.generator.steps.template.title',
      contentKey: 'tours.reports.generator.steps.template.content',
      placement: 'right'
    },
    {
      target: '[data-tour="period-selection"]',
      titleKey: 'tours.reports.generator.steps.period.title',
      contentKey: 'tours.reports.generator.steps.period.content',
      placement: 'right'
    },
    {
      target: '[data-tour="system-selection"]',
      titleKey: 'tours.reports.generator.steps.systems.title',
      contentKey: 'tours.reports.generator.steps.systems.content',
      placement: 'right'
    },
    {
      target: '[data-tour="options-selection"]',
      titleKey: 'tours.reports.generator.steps.options.title',
      contentKey: 'tours.reports.generator.steps.options.content',
      placement: 'right'
    },
    {
      target: '[data-tour="preview-panel"]',
      titleKey: 'tours.reports.generator.steps.preview.title',
      contentKey: 'tours.reports.generator.steps.preview.content',
      placement: 'left'
    },
    {
      target: '[data-tour="generate-actions"]',
      titleKey: 'tours.reports.generator.steps.actions.title',
      contentKey: 'tours.reports.generator.steps.actions.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.reports.generator.steps.complete.title',
      contentKey: 'tours.reports.generator.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Report templates tab tour
 * Shows users how to manage report templates
 */
export const reportsTemplatesTour: TourConfig = {
  id: REPORTS_TEMPLATES_TOUR,
  nameKey: 'tours.reports.templates.title',
  descriptionKey: 'tours.reports.templates.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/reports',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.reports.templates.steps.welcome.title',
      contentKey: 'tours.reports.templates.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="create-template-button"]',
      titleKey: 'tours.reports.templates.steps.create.title',
      contentKey: 'tours.reports.templates.steps.create.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="templates-grid"]',
      titleKey: 'tours.reports.templates.steps.grid.title',
      contentKey: 'tours.reports.templates.steps.grid.content',
      placement: 'top'
    },
    {
      target: '[data-tour="template-card"]',
      titleKey: 'tours.reports.templates.steps.card.title',
      contentKey: 'tours.reports.templates.steps.card.content',
      placement: 'bottom'
    },
    {
      target: 'body',
      titleKey: 'tours.reports.templates.steps.complete.title',
      contentKey: 'tours.reports.templates.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Report history tab tour
 * Shows users how to view and manage generated reports
 */
export const reportsHistoryTour: TourConfig = {
  id: REPORTS_HISTORY_TOUR,
  nameKey: 'tours.reports.history.title',
  descriptionKey: 'tours.reports.history.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/reports',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.reports.history.steps.welcome.title',
      contentKey: 'tours.reports.history.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="history-filters"]',
      titleKey: 'tours.reports.history.steps.filters.title',
      contentKey: 'tours.reports.history.steps.filters.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="refresh-button"]',
      titleKey: 'tours.reports.history.steps.refresh.title',
      contentKey: 'tours.reports.history.steps.refresh.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="history-table"]',
      titleKey: 'tours.reports.history.steps.table.title',
      contentKey: 'tours.reports.history.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.reports.history.steps.complete.title',
      contentKey: 'tours.reports.history.steps.complete.content',
      disableInteraction: true
    }
  ]
};
