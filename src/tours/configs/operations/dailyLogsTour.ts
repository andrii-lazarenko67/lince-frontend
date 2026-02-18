import type { TourConfig } from '../../types';
import { DAILY_LOGS_LIST_TOUR, DAILY_LOGS_NEW_TOUR, DAILY_LOGS_DETAIL_TOUR } from '../../constants';

/**
 * Daily logs list page tour
 * Introduces operators to daily log management features
 */
export const dailyLogsListTour: TourConfig = {
  id: DAILY_LOGS_LIST_TOUR,
  nameKey: 'tours.dailyLogs.list.title',
  descriptionKey: 'tours.dailyLogs.list.description',
  category: 'operations',
  roles: ['admin', 'manager', 'operator'], // All users
  page: '/daily-logs',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.dailyLogs.list.steps.welcome.title',
      contentKey: 'tours.dailyLogs.list.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="dailylogs-header"]',
      titleKey: 'tours.dailyLogs.list.steps.header.title',
      contentKey: 'tours.dailyLogs.list.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="view-mode"]',
      titleKey: 'tours.dailyLogs.list.steps.viewMode.title',
      contentKey: 'tours.dailyLogs.list.steps.viewMode.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="export-button"]',
      titleKey: 'tours.dailyLogs.list.steps.export.title',
      contentKey: 'tours.dailyLogs.list.steps.export.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="new-log-button"]',
      titleKey: 'tours.dailyLogs.list.steps.newLog.title',
      contentKey: 'tours.dailyLogs.list.steps.newLog.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="filters"]',
      titleKey: 'tours.dailyLogs.list.steps.filters.title',
      contentKey: 'tours.dailyLogs.list.steps.filters.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="dailylogs-table"]',
      titleKey: 'tours.dailyLogs.list.steps.table.title',
      contentKey: 'tours.dailyLogs.list.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.dailyLogs.list.steps.complete.title',
      contentKey: 'tours.dailyLogs.list.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * New daily log form tour
 * Guides users through creating a new daily log entry
 */
export const dailyLogsNewTour: TourConfig = {
  id: DAILY_LOGS_NEW_TOUR,
  nameKey: 'tours.dailyLogs.new.title',
  descriptionKey: 'tours.dailyLogs.new.description',
  category: 'operations',
  roles: ['admin', 'manager', 'operator'],
  page: '/daily-logs/new',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.dailyLogs.new.steps.welcome.title',
      contentKey: 'tours.dailyLogs.new.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="new-log-header"]',
      titleKey: 'tours.dailyLogs.new.steps.header.title',
      contentKey: 'tours.dailyLogs.new.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="action-buttons"]',
      titleKey: 'tours.dailyLogs.new.steps.actionButtons.title',
      contentKey: 'tours.dailyLogs.new.steps.actionButtons.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="record-type"]',
      titleKey: 'tours.dailyLogs.new.steps.recordType.title',
      contentKey: 'tours.dailyLogs.new.steps.recordType.content',
      placement: 'right'
    },
    {
      target: '[data-tour="system-selection"]',
      titleKey: 'tours.dailyLogs.new.steps.systemSelection.title',
      contentKey: 'tours.dailyLogs.new.steps.systemSelection.content',
      placement: 'right'
    },
    {
      target: '[data-tour="date-period"]',
      titleKey: 'tours.dailyLogs.new.steps.datePeriod.title',
      contentKey: 'tours.dailyLogs.new.steps.datePeriod.content',
      placement: 'right'
    },
    {
      target: '[data-tour="monitoring-values"]',
      titleKey: 'tours.dailyLogs.new.steps.monitoringValues.title',
      contentKey: 'tours.dailyLogs.new.steps.monitoringValues.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.dailyLogs.new.steps.complete.title',
      contentKey: 'tours.dailyLogs.new.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Daily log detail page tour
 * Shows users how to review daily log entries and monitoring values
 */
export const dailyLogsDetailTour: TourConfig = {
  id: DAILY_LOGS_DETAIL_TOUR,
  nameKey: 'tours.dailyLogs.detail.title',
  descriptionKey: 'tours.dailyLogs.detail.description',
  category: 'operations',
  roles: ['admin', 'manager', 'operator'],
  page: '/daily-logs/:id',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.dailyLogs.detail.steps.welcome.title',
      contentKey: 'tours.dailyLogs.detail.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="detail-header"]',
      titleKey: 'tours.dailyLogs.detail.steps.header.title',
      contentKey: 'tours.dailyLogs.detail.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="record-info"]',
      titleKey: 'tours.dailyLogs.detail.steps.recordInfo.title',
      contentKey: 'tours.dailyLogs.detail.steps.recordInfo.content',
      placement: 'right'
    },
    {
      target: '[data-tour="monitoring-entries"]',
      titleKey: 'tours.dailyLogs.detail.steps.monitoringEntries.title',
      contentKey: 'tours.dailyLogs.detail.steps.monitoringEntries.content',
      placement: 'left'
    },
    {
      target: 'body',
      titleKey: 'tours.dailyLogs.detail.steps.complete.title',
      contentKey: 'tours.dailyLogs.detail.steps.complete.content',
      disableInteraction: true
    }
  ]
};
