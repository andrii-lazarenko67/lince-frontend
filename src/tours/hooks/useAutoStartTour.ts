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
    if (!enabled || !autoStartEnabled || isRunning || isCompleted(tourId)) {
      return;
    }

    // Check if this is the first visit
    try {
      const visitedKey = `${TOUR_FIRST_VISIT_KEY}_${tourId}`;
      const hasVisited = localStorage.getItem(visitedKey);

      if (!hasVisited) {
        console.log(`[Tour] First visit detected for ${tourId}, starting tour...`);

        // Mark as visited
        localStorage.setItem(visitedKey, 'true');

        // Wait longer to ensure page elements are fully rendered
        const timer = setTimeout(() => {
          console.log(`[Tour] Attempting to start ${tourId}`);
          start(tourId);
        }, 1500);

        return () => clearTimeout(timer);
      } else {
        console.log(`[Tour] Page already visited for ${tourId}, skipping auto-start`);
      }
    } catch (error) {
      console.error('Failed to check first visit:', error);
    }
  }, [tourId, enabled, autoStartEnabled, isRunning, isCompleted, start, location.pathname]);
};
