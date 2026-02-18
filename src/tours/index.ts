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
export { clientsListTour, clientsAddTour, clientsDetailTour, clientsUsersTour, clientsFirstSetupTour } from './configs/management/clientsTour';

// Central tour registry
import { dashboardTour } from './configs/operations/dashboardTour';
import { dailyLogsListTour, dailyLogsNewTour, dailyLogsDetailTour } from './configs/operations/dailyLogsTour';
import { clientsListTour, clientsAddTour, clientsDetailTour, clientsUsersTour, clientsFirstSetupTour } from './configs/management/clientsTour';
import type { TourConfig } from './types';

export const allTours: TourConfig[] = [
  dashboardTour,
  dailyLogsListTour,
  dailyLogsNewTour,
  dailyLogsDetailTour,
  clientsListTour,
  clientsAddTour,
  clientsDetailTour,
  clientsUsersTour,
  clientsFirstSetupTour
  // More tours will be added here in future phases
];
