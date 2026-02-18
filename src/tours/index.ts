// Export all tour components
export { TourProvider, useTourContext } from './components/TourProvider';
export { TourRunner } from './components/TourRunner';

// Export hooks
export { useTour } from './hooks/useTour';
export { useTourProgress } from './hooks/useTourProgress';
export { useAutoStartTour } from './hooks/useAutoStartTour';

// Export types
export type { TourConfig, TourStep, TourCategory, TourProgress, UserRole } from './types';

// Export constants
export * from './constants';

// Export tour configurations
export { dashboardTour } from './configs/operations/dashboardTour';
export { dailyLogsListTour, dailyLogsNewTour, dailyLogsDetailTour } from './configs/operations/dailyLogsTour';
export { incidentsListTour, incidentsNewTour, incidentsDetailTour } from './configs/operations/incidentsTour';
export { inspectionsListTour, inspectionsNewTour, inspectionsDetailTour } from './configs/operations/inspectionsTour';
export { systemsListTour, systemsDetailTour, systemsMonitoringPointsTour, systemsChecklistTour } from './configs/operations/systemsTour';
export { productsListTour, productsFormTour, productsDetailTour } from './configs/management/productsTour';
export { reportsWorkflowTour, reportsGeneratorTour, reportsTemplatesTour, reportsHistoryTour } from './configs/management/reportsTour';
export { clientsListTour, clientsAddTour, clientsDetailTour, clientsUsersTour, clientsFirstSetupTour } from './configs/management/clientsTour';
export { notificationsTour } from './configs/management/notificationsTour';
export { profileTour } from './configs/management/profileTour';
export { libraryListTour, libraryUploadTour } from './configs/management/libraryTour';
export {
  settingsOverviewTour,
  settingsParametersTour,
  settingsUnitsTour,
  settingsSystemTypesTour,
  settingsProductTypesTour,
  settingsClientsTour
} from './configs/administration/settingsTour';
export { usersTour } from './configs/administration/usersTour';

// Central tour registry
import { dashboardTour } from './configs/operations/dashboardTour';
import { dailyLogsListTour, dailyLogsNewTour, dailyLogsDetailTour } from './configs/operations/dailyLogsTour';
import { incidentsListTour, incidentsNewTour, incidentsDetailTour } from './configs/operations/incidentsTour';
import { inspectionsListTour, inspectionsNewTour, inspectionsDetailTour } from './configs/operations/inspectionsTour';
import { systemsListTour, systemsDetailTour, systemsMonitoringPointsTour, systemsChecklistTour } from './configs/operations/systemsTour';
import { productsListTour, productsFormTour, productsDetailTour } from './configs/management/productsTour';
import { reportsWorkflowTour, reportsGeneratorTour, reportsTemplatesTour, reportsHistoryTour } from './configs/management/reportsTour';
import { clientsListTour, clientsAddTour, clientsDetailTour, clientsUsersTour, clientsFirstSetupTour } from './configs/management/clientsTour';
import { notificationsTour } from './configs/management/notificationsTour';
import { profileTour } from './configs/management/profileTour';
import { libraryListTour, libraryUploadTour } from './configs/management/libraryTour';
import {
  settingsOverviewTour,
  settingsParametersTour,
  settingsUnitsTour,
  settingsSystemTypesTour,
  settingsProductTypesTour,
  settingsClientsTour
} from './configs/administration/settingsTour';
import { usersTour } from './configs/administration/usersTour';
import type { TourConfig } from './types';

export const allTours: TourConfig[] = [
  dashboardTour,
  dailyLogsListTour,
  dailyLogsNewTour,
  dailyLogsDetailTour,
  incidentsListTour,
  incidentsNewTour,
  incidentsDetailTour,
  inspectionsListTour,
  inspectionsNewTour,
  inspectionsDetailTour,
  systemsListTour,
  systemsDetailTour,
  systemsMonitoringPointsTour,
  systemsChecklistTour,
  productsListTour,
  productsFormTour,
  productsDetailTour,
  reportsWorkflowTour,
  reportsGeneratorTour,
  reportsTemplatesTour,
  reportsHistoryTour,
  clientsListTour,
  clientsAddTour,
  clientsDetailTour,
  clientsUsersTour,
  clientsFirstSetupTour,
  notificationsTour,
  profileTour,
  libraryListTour,
  libraryUploadTour,
  settingsOverviewTour,
  settingsParametersTour,
  settingsUnitsTour,
  settingsSystemTypesTour,
  settingsProductTypesTour,
  settingsClientsTour,
  usersTour
  // More tours will be added here in future phases
];
