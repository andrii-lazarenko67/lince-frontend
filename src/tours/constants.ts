import type { TourCategory } from './types';

/**
 * Tour ID constants
 * Organized by category for easy reference
 */

// Operations Tours
export const DASHBOARD_TOUR = 'dashboard-overview';
export const DAILY_LOGS_LIST_TOUR = 'daily-logs-list';
export const DAILY_LOGS_NEW_TOUR = 'daily-logs-new';
export const DAILY_LOGS_DETAIL_TOUR = 'daily-logs-detail';
export const INSPECTIONS_LIST_TOUR = 'inspections-list';
export const INSPECTIONS_NEW_TOUR = 'inspections-new';
export const INSPECTIONS_DETAIL_TOUR = 'inspections-detail';
export const INCIDENTS_LIST_TOUR = 'incidents-list';
export const INCIDENTS_NEW_TOUR = 'incidents-new';
export const INCIDENTS_DETAIL_TOUR = 'incidents-detail';
export const SYSTEMS_LIST_TOUR = 'systems-list';
export const SYSTEMS_DETAIL_TOUR = 'systems-detail';
export const SYSTEMS_MONITORING_POINTS_TOUR = 'systems-monitoring-points';
export const SYSTEMS_CHECKLIST_TOUR = 'systems-checklist';

// Management Tours
export const REPORTS_GENERATOR_TOUR = 'reports-generator';
export const REPORTS_TEMPLATES_TOUR = 'reports-templates';
export const REPORTS_HISTORY_TOUR = 'reports-history';
export const REPORTS_WORKFLOW_TOUR = 'reports-workflow';
export const PRODUCTS_LIST_TOUR = 'products-list';
export const PRODUCTS_MODAL_TOUR = 'products-modal';
// Clients module tours
export const CLIENTS_LIST_TOUR = 'clients-list';
export const CLIENTS_ADD_TOUR = 'clients-add';
export const CLIENTS_DETAIL_TOUR = 'clients-detail';
export const CLIENTS_USERS_TOUR = 'clients-users';
export const CLIENTS_FIRST_SETUP_TOUR = 'clients-first-setup';

export const LIBRARY_LIST_TOUR = 'library-list';
export const LIBRARY_UPLOAD_TOUR = 'library-upload';
export const PROFILE_TOUR = 'profile-overview';
export const NOTIFICATIONS_TOUR = 'notifications-overview';

// Administration Tours
export const SETTINGS_OVERVIEW_TOUR = 'settings-overview';
export const SETTINGS_PARAMETERS_TOUR = 'settings-parameters';
export const SETTINGS_UNITS_TOUR = 'settings-units';
export const SETTINGS_SYSTEM_TYPES_TOUR = 'settings-system-types';
export const SETTINGS_PRODUCT_TYPES_TOUR = 'settings-product-types';
export const SETTINGS_CLIENTS_TOUR = 'settings-clients';
export const USERS_TOUR = 'users-management';
export const LOGIN_TOUR = 'login-features';
export const SIGNUP_TOUR = 'signup-process';

/**
 * Category labels (translation keys)
 */
export const CATEGORY_LABELS: Record<TourCategory, string> = {
  operations: 'tours.categories.operations',
  management: 'tours.categories.management',
  administration: 'tours.categories.administration'
};

/**
 * LocalStorage keys
 */
export const TOUR_COMPLETED_KEY = 'lince_tours_completed';
export const TOUR_PREFERENCES_KEY = 'lince_tour_preferences';
export const TOUR_FIRST_VISIT_KEY = 'lince_tour_first_visit';
