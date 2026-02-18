import type { TourConfig } from '../../types';
import { USERS_TOUR } from '../../constants';

/**
 * Users management tour
 * Guides administrators through user account management
 */
export const usersTour: TourConfig = {
  id: USERS_TOUR,
  nameKey: 'tours.users.title',
  descriptionKey: 'tours.users.description',
  category: 'administration',
  roles: ['admin'],
  page: '/users',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.users.steps.welcome.title',
      contentKey: 'tours.users.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="users-header"]',
      titleKey: 'tours.users.steps.header.title',
      contentKey: 'tours.users.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="export-dropdown"]',
      titleKey: 'tours.users.steps.export.title',
      contentKey: 'tours.users.steps.export.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="add-user-button"]',
      titleKey: 'tours.users.steps.addUser.title',
      contentKey: 'tours.users.steps.addUser.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="users-table"]',
      titleKey: 'tours.users.steps.table.title',
      contentKey: 'tours.users.steps.table.content',
      placement: 'top'
    },
    {
      target: '[data-tour="user-actions"]',
      titleKey: 'tours.users.steps.actions.title',
      contentKey: 'tours.users.steps.actions.content',
      placement: 'left'
    },
    {
      target: 'body',
      titleKey: 'tours.users.steps.complete.title',
      contentKey: 'tours.users.steps.complete.content',
      disableInteraction: true
    }
  ]
};
