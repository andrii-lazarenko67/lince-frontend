import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import { useTour } from './useTour';
import { TOUR_FIRST_VISIT_KEY } from '../constants';

/**
 * Hook to auto-start tours on first visit
 */
export const useAutoStartTour = (tourId: string, enabled: boolean = true) => {
  const location = useLocation();
  const { start, isCompleted, isRunning } = useTour();
  const autoStartEnabled = useAppSelector(
    (state) => state.tour.tourPreferences.autoStartEnabled
  );

  useEffect(() => {
    // Only auto-start if:
    // 1. Auto-start is enabled in preferences
    // 2. This specific auto-start is enabled
    // 3. Tour hasn't been completed
    // 4. No tour is currently running
    // 5. User hasn't dismissed first-visit prompt
    if (!enabled || !autoStartEnabled || isRunning || isCompleted(tourId)) {
      return;
    }

    // Check if this is the first visit
    try {
      const visitedKey = `${TOUR_FIRST_VISIT_KEY}_${tourId}`;
      const hasVisited = localStorage.getItem(visitedKey);

      if (!hasVisited) {
        // Mark as visited
        localStorage.setItem(visitedKey, 'true');

        // Start tour after a short delay to ensure page is loaded
        const timer = setTimeout(() => {
          start(tourId);
        }, 500);

        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Failed to check first visit:', error);
    }
  }, [tourId, enabled, autoStartEnabled, isRunning, isCompleted, start, location.pathname]);
};
