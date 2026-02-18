import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { startTour, stopTour, completeTour, resetTour } from '../../store/slices/tourSlice';
import type { TourConfig } from '../types';

interface UseTourReturn {
  /**
   * Start a specific tour
   */
  start: (tourId: string) => void;

  /**
   * Stop the currently running tour
   */
  stop: () => void;

  /**
   * Mark a tour as completed
   */
  complete: (tourId: string) => void;

  /**
   * Reset a tour (remove from completed list)
   */
  reset: (tourId: string) => void;

  /**
   * Check if a tour has been completed
   */
  isCompleted: (tourId: string) => boolean;

  /**
   * Check if a tour is currently running
   */
  isRunning: boolean;

  /**
   * Currently active tour ID
   */
  activeTour: string | null;

  /**
   * All completed tour IDs
   */
  completedTours: string[];

  /**
   * Get tour configuration with translated content
   */
  getTourConfig: (tourId: string, tours: TourConfig[]) => TourConfig | undefined;
}

/**
 * Hook for controlling tours
 */
export const useTour = (): UseTourReturn => {
  const dispatch = useAppDispatch();
  const tourState = useAppSelector((state) => state.tour);

  const start = useCallback((tourId: string) => {
    dispatch(startTour(tourId));
  }, [dispatch]);

  const stop = useCallback(() => {
    dispatch(stopTour());
  }, [dispatch]);

  const complete = useCallback((tourId: string) => {
    dispatch(completeTour(tourId));
  }, [dispatch]);

  const reset = useCallback((tourId: string) => {
    dispatch(resetTour(tourId));
  }, [dispatch]);

  const isCompleted = useCallback((tourId: string) => {
    return tourState.completedTours.includes(tourId);
  }, [tourState.completedTours]);

  const getTourConfig = useCallback((tourId: string, tours: TourConfig[]) => {
    return tours.find(tour => tour.id === tourId);
  }, []);

  return {
    start,
    stop,
    complete,
    reset,
    isCompleted,
    isRunning: tourState.isRunning,
    activeTour: tourState.activeTour,
    completedTours: tourState.completedTours,
    getTourConfig
  };
};
