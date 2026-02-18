import type { TourConfig } from '../../types';
import { NOTIFICATIONS_TOUR } from '../../constants';

/**
 * Notifications page tour
 * Introduces users to the notifications system
 */
export const notificationsTour: TourConfig = {
  id: NOTIFICATIONS_TOUR,
  nameKey: 'tours.notifications.title',
  descriptionKey: 'tours.notifications.description',
  category: 'management',
  roles: ['admin', 'manager', 'operator'],
  page: '/notifications',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.notifications.steps.welcome.title',
      contentKey: 'tours.notifications.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="notifications-header"]',
      titleKey: 'tours.notifications.steps.header.title',
      contentKey: 'tours.notifications.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="export-button"]',
      titleKey: 'tours.notifications.steps.export.title',
      contentKey: 'tours.notifications.steps.export.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="create-notification-button"]',
      titleKey: 'tours.notifications.steps.create.title',
      contentKey: 'tours.notifications.steps.create.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="notification-tabs"]',
      titleKey: 'tours.notifications.steps.tabs.title',
      contentKey: 'tours.notifications.steps.tabs.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="my-notifications"]',
      titleKey: 'tours.notifications.steps.myNotifications.title',
      contentKey: 'tours.notifications.steps.myNotifications.content',
      placement: 'top'
    },
    {
      target: '[data-tour="notification-actions"]',
      titleKey: 'tours.notifications.steps.actions.title',
      contentKey: 'tours.notifications.steps.actions.content',
      placement: 'bottom'
    },
    {
      target: 'body',
      titleKey: 'tours.notifications.steps.complete.title',
      contentKey: 'tours.notifications.steps.complete.content',
      disableInteraction: true
    }
  ]
};
