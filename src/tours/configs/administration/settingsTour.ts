import type { TourConfig } from '../../types';
import {
  SETTINGS_OVERVIEW_TOUR,
  SETTINGS_PARAMETERS_TOUR,
  SETTINGS_UNITS_TOUR,
  SETTINGS_SYSTEM_TYPES_TOUR,
  SETTINGS_PRODUCT_TYPES_TOUR,
  SETTINGS_CLIENTS_TOUR
} from '../../constants';

/**
 * Settings overview tour
 * Introduces users to the settings page and available configuration options
 */
export const settingsOverviewTour: TourConfig = {
  id: SETTINGS_OVERVIEW_TOUR,
  nameKey: 'tours.settings.overview.title',
  descriptionKey: 'tours.settings.overview.description',
  category: 'administration',
  roles: ['admin'],
  page: '/settings',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.settings.overview.steps.welcome.title',
      contentKey: 'tours.settings.overview.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="settings-header"]',
      titleKey: 'tours.settings.overview.steps.header.title',
      contentKey: 'tours.settings.overview.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="settings-tabs"]',
      titleKey: 'tours.settings.overview.steps.tabs.title',
      contentKey: 'tours.settings.overview.steps.tabs.content',
      placement: 'bottom'
    },
    {
      target: 'body',
      titleKey: 'tours.settings.overview.steps.complete.title',
      contentKey: 'tours.settings.overview.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Parameters settings tour
 * Guides through water quality parameters configuration
 */
export const settingsParametersTour: TourConfig = {
  id: SETTINGS_PARAMETERS_TOUR,
  nameKey: 'tours.settings.parameters.title',
  descriptionKey: 'tours.settings.parameters.description',
  category: 'administration',
  roles: ['admin'],
  page: '/settings',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.settings.parameters.steps.welcome.title',
      contentKey: 'tours.settings.parameters.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="parameters-section"]',
      titleKey: 'tours.settings.parameters.steps.section.title',
      contentKey: 'tours.settings.parameters.steps.section.content',
      placement: 'top'
    },
    {
      target: '[data-tour="add-parameter-button"]',
      titleKey: 'tours.settings.parameters.steps.add.title',
      contentKey: 'tours.settings.parameters.steps.add.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="parameters-table"]',
      titleKey: 'tours.settings.parameters.steps.table.title',
      contentKey: 'tours.settings.parameters.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.settings.parameters.steps.complete.title',
      contentKey: 'tours.settings.parameters.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Units settings tour
 * Guides through measurement units configuration
 */
export const settingsUnitsTour: TourConfig = {
  id: SETTINGS_UNITS_TOUR,
  nameKey: 'tours.settings.units.title',
  descriptionKey: 'tours.settings.units.description',
  category: 'administration',
  roles: ['admin'],
  page: '/settings',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.settings.units.steps.welcome.title',
      contentKey: 'tours.settings.units.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="units-section"]',
      titleKey: 'tours.settings.units.steps.section.title',
      contentKey: 'tours.settings.units.steps.section.content',
      placement: 'top'
    },
    {
      target: '[data-tour="add-unit-button"]',
      titleKey: 'tours.settings.units.steps.add.title',
      contentKey: 'tours.settings.units.steps.add.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="units-table"]',
      titleKey: 'tours.settings.units.steps.table.title',
      contentKey: 'tours.settings.units.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.settings.units.steps.complete.title',
      contentKey: 'tours.settings.units.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * System Types settings tour
 * Guides through water treatment system types configuration
 */
export const settingsSystemTypesTour: TourConfig = {
  id: SETTINGS_SYSTEM_TYPES_TOUR,
  nameKey: 'tours.settings.systemTypes.title',
  descriptionKey: 'tours.settings.systemTypes.description',
  category: 'administration',
  roles: ['admin'],
  page: '/settings',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.settings.systemTypes.steps.welcome.title',
      contentKey: 'tours.settings.systemTypes.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="system-types-section"]',
      titleKey: 'tours.settings.systemTypes.steps.section.title',
      contentKey: 'tours.settings.systemTypes.steps.section.content',
      placement: 'top'
    },
    {
      target: '[data-tour="add-system-type-button"]',
      titleKey: 'tours.settings.systemTypes.steps.add.title',
      contentKey: 'tours.settings.systemTypes.steps.add.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="system-types-table"]',
      titleKey: 'tours.settings.systemTypes.steps.table.title',
      contentKey: 'tours.settings.systemTypes.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.settings.systemTypes.steps.complete.title',
      contentKey: 'tours.settings.systemTypes.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Product Types settings tour
 * Guides through chemical product types configuration
 */
export const settingsProductTypesTour: TourConfig = {
  id: SETTINGS_PRODUCT_TYPES_TOUR,
  nameKey: 'tours.settings.productTypes.title',
  descriptionKey: 'tours.settings.productTypes.description',
  category: 'administration',
  roles: ['admin'],
  page: '/settings',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.settings.productTypes.steps.welcome.title',
      contentKey: 'tours.settings.productTypes.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="product-types-section"]',
      titleKey: 'tours.settings.productTypes.steps.section.title',
      contentKey: 'tours.settings.productTypes.steps.section.content',
      placement: 'top'
    },
    {
      target: '[data-tour="add-product-type-button"]',
      titleKey: 'tours.settings.productTypes.steps.add.title',
      contentKey: 'tours.settings.productTypes.steps.add.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="product-types-table"]',
      titleKey: 'tours.settings.productTypes.steps.table.title',
      contentKey: 'tours.settings.productTypes.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.settings.productTypes.steps.complete.title',
      contentKey: 'tours.settings.productTypes.steps.complete.content',
      disableInteraction: true
    }
  ]
};

/**
 * Clients settings tour (for service providers)
 * Guides through client management in settings
 */
export const settingsClientsTour: TourConfig = {
  id: SETTINGS_CLIENTS_TOUR,
  nameKey: 'tours.settings.clients.title',
  descriptionKey: 'tours.settings.clients.description',
  category: 'administration',
  roles: ['admin'],
  page: '/settings',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.settings.clients.steps.welcome.title',
      contentKey: 'tours.settings.clients.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="clients-section"]',
      titleKey: 'tours.settings.clients.steps.section.title',
      contentKey: 'tours.settings.clients.steps.section.content',
      placement: 'top'
    },
    {
      target: '[data-tour="add-client-button"]',
      titleKey: 'tours.settings.clients.steps.add.title',
      contentKey: 'tours.settings.clients.steps.add.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="clients-table"]',
      titleKey: 'tours.settings.clients.steps.table.title',
      contentKey: 'tours.settings.clients.steps.table.content',
      placement: 'top'
    },
    {
      target: 'body',
      titleKey: 'tours.settings.clients.steps.complete.title',
      contentKey: 'tours.settings.clients.steps.complete.content',
      disableInteraction: true
    }
  ]
};
