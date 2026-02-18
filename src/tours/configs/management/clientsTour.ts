import type { TourConfig } from '../../types';
import { CLIENTS_LIST_TOUR, CLIENTS_ADD_TOUR, CLIENTS_DETAIL_TOUR, CLIENTS_USERS_TOUR, CLIENTS_FIRST_SETUP_TOUR } from '../../constants';

/**
 * Clients list page tour
 * Introduces managers/admins to client management features
 */
export const clientsListTour: TourConfig = {
  id: CLIENTS_LIST_TOUR,
  nameKey: 'tours.clients.list.title',
  descriptionKey: 'tours.clients.list.description',
  category: 'management',
  roles: ['admin', 'manager'], // Only for managers and admins
  page: '/clients',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.clients.list.steps.welcome.title',
      contentKey: 'tours.clients.list.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="clients-header"]',
      titleKey: 'tours.clients.list.steps.header.title',
      contentKey: 'tours.clients.list.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="add-client-button"]',
      titleKey: 'tours.clients.list.steps.addButton.title',
      contentKey: 'tours.clients.list.steps.addButton.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="search-clients"]',
      titleKey: 'tours.clients.list.steps.search.title',
      contentKey: 'tours.clients.list.steps.search.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="clients-table"]',
      titleKey: 'tours.clients.list.steps.table.title',
      contentKey: 'tours.clients.list.steps.table.content',
      placement: 'top'
    },
    {
      target: '[data-tour="client-actions"]',
      titleKey: 'tours.clients.list.steps.actions.title',
      contentKey: 'tours.clients.list.steps.actions.content',
      placement: 'left'
    },
    {
      target: '[data-tour="pagination"]',
      titleKey: 'tours.clients.list.steps.pagination.title',
      contentKey: 'tours.clients.list.steps.pagination.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.clients.list.steps.complete.title',
      contentKey: 'tours.clients.list.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Add client form tour
 * Guides through the process of adding a new client
 */
export const clientsAddTour: TourConfig = {
  id: CLIENTS_ADD_TOUR,
  nameKey: 'tours.clients.add.title',
  descriptionKey: 'tours.clients.add.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/clients/new',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.clients.add.steps.welcome.title',
      contentKey: 'tours.clients.add.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="client-form"]',
      titleKey: 'tours.clients.add.steps.form.title',
      contentKey: 'tours.clients.add.steps.form.content',
      placement: 'right'
    },
    {
      target: '[data-tour="basic-info"]',
      titleKey: 'tours.clients.add.steps.basicInfo.title',
      contentKey: 'tours.clients.add.steps.basicInfo.content',
      placement: 'right'
    },
    {
      target: '[data-tour="contact-info"]',
      titleKey: 'tours.clients.add.steps.contactInfo.title',
      contentKey: 'tours.clients.add.steps.contactInfo.content',
      placement: 'right'
    },
    {
      target: '[data-tour="submit-button"]',
      titleKey: 'tours.clients.add.steps.submit.title',
      contentKey: 'tours.clients.add.steps.submit.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.clients.add.steps.complete.title',
      contentKey: 'tours.clients.add.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Client detail page tour
 * Explains client details, editing, and management options
 */
export const clientsDetailTour: TourConfig = {
  id: CLIENTS_DETAIL_TOUR,
  nameKey: 'tours.clients.detail.title',
  descriptionKey: 'tours.clients.detail.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/clients/:id',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.clients.detail.steps.welcome.title',
      contentKey: 'tours.clients.detail.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="client-header"]',
      titleKey: 'tours.clients.detail.steps.header.title',
      contentKey: 'tours.clients.detail.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="client-info"]',
      titleKey: 'tours.clients.detail.steps.info.title',
      contentKey: 'tours.clients.detail.steps.info.content',
      placement: 'right'
    },
    {
      target: '[data-tour="edit-button"]',
      titleKey: 'tours.clients.detail.steps.edit.title',
      contentKey: 'tours.clients.detail.steps.edit.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="manage-users"]',
      titleKey: 'tours.clients.detail.steps.users.title',
      contentKey: 'tours.clients.detail.steps.users.content',
      placement: 'bottom'
    },
    {
      target: 'body',
      titleKey: 'tours.clients.detail.steps.complete.title',
      contentKey: 'tours.clients.detail.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Client users management tour
 * Guides through managing user access to a client
 */
export const clientsUsersTour: TourConfig = {
  id: CLIENTS_USERS_TOUR,
  nameKey: 'tours.clients.users.title',
  descriptionKey: 'tours.clients.users.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/clients/:id/users',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.clients.users.steps.welcome.title',
      contentKey: 'tours.clients.users.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="users-header"]',
      titleKey: 'tours.clients.users.steps.header.title',
      contentKey: 'tours.clients.users.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="add-user-button"]',
      titleKey: 'tours.clients.users.steps.addButton.title',
      contentKey: 'tours.clients.users.steps.addButton.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="users-table"]',
      titleKey: 'tours.clients.users.steps.table.title',
      contentKey: 'tours.clients.users.steps.table.content',
      placement: 'top'
    },
    {
      target: '[data-tour="access-level"]',
      titleKey: 'tours.clients.users.steps.accessLevel.title',
      contentKey: 'tours.clients.users.steps.accessLevel.content',
      placement: 'left'
    },
    {
      target: 'body',
      titleKey: 'tours.clients.users.steps.complete.title',
      contentKey: 'tours.clients.users.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * First client setup tour
 * Guides service providers through adding their first client after signup
 */
export const clientsFirstSetupTour: TourConfig = {
  id: CLIENTS_FIRST_SETUP_TOUR,
  nameKey: 'tours.clients.firstSetup.title',
  descriptionKey: 'tours.clients.firstSetup.description',
  category: 'management',
  roles: ['admin', 'manager'],
  page: '/first-client-setup',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.clients.firstSetup.steps.welcome.title',
      contentKey: 'tours.clients.firstSetup.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="setup-header"]',
      titleKey: 'tours.clients.firstSetup.steps.header.title',
      contentKey: 'tours.clients.firstSetup.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="client-form"]',
      titleKey: 'tours.clients.firstSetup.steps.form.title',
      contentKey: 'tours.clients.firstSetup.steps.form.content',
      placement: 'right'
    },
    {
      target: '[data-tour="required-fields"]',
      titleKey: 'tours.clients.firstSetup.steps.requiredFields.title',
      contentKey: 'tours.clients.firstSetup.steps.requiredFields.content',
      placement: 'right'
    },
    {
      target: '[data-tour="contact-fields"]',
      titleKey: 'tours.clients.firstSetup.steps.contactFields.title',
      contentKey: 'tours.clients.firstSetup.steps.contactFields.content',
      placement: 'right'
    },
    {
      target: '[data-tour="submit-button"]',
      titleKey: 'tours.clients.firstSetup.steps.submit.title',
      contentKey: 'tours.clients.firstSetup.steps.submit.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.clients.firstSetup.steps.complete.title',
      contentKey: 'tours.clients.firstSetup.steps.complete.content',
      disableInteraction: true
    }
  ]
};
