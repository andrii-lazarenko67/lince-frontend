import { useMemo } from 'react';
import { useAppSelector } from '../../hooks';
import type { TourConfig, TourProgress } from '../types';

/**
 * Hook for tracking tour completion progress
 */
export const useTourProgress = (tours: TourConfig[]): TourProgress => {
  const completedTours = useAppSelector((state) => state.tour.completedTours);

  const progress = useMemo(() => {
    const totalTours = tours.length;
    const completed = completedTours.length;

    // Calculate by category
    const byCategory = {
      operations: { total: 0, completed: 0 },
      management: { total: 0, completed: 0 },
      administration: { total: 0, completed: 0 }
    };

    tours.forEach((tour) => {
      byCategory[tour.category].total += 1;
      if (completedTours.includes(tour.id)) {
        byCategory[tour.category].completed += 1;
      }
    });

    return {
      totalTours,
      completedTours: completed,
      percentage: totalTours > 0 ? Math.round((completed / totalTours) * 100) : 0,
      byCategory
    };
  }, [tours, completedTours]);

  return progress;
};
