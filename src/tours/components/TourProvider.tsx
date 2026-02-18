import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { startTour, stopTour, completeTour, resetTour } from '../../store/slices/tourSlice';

interface TourContextValue {
  activeTour: string | null;
  isRunning: boolean;
  stepIndex: number;
  completedTours: string[];
  startTour: (tourId: string) => void;
  stopTour: () => void;
  completeTour: (tourId: string) => void;
  resetTour: (tourId: string) => void;
  isTourCompleted: (tourId: string) => boolean;
}

const TourContext = createContext<TourContextValue | undefined>(undefined);

export const useTourContext = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTourContext must be used within TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const tourState = useAppSelector((state) => state.tour);

  const value: TourContextValue = {
    activeTour: tourState.activeTour,
    isRunning: tourState.isRunning,
    stepIndex: tourState.stepIndex,
    completedTours: tourState.completedTours,
    startTour: (tourId: string) => dispatch(startTour(tourId)),
    stopTour: () => dispatch(stopTour()),
    completeTour: (tourId: string) => dispatch(completeTour(tourId)),
    resetTour: (tourId: string) => dispatch(resetTour(tourId)),
    isTourCompleted: (tourId: string) => tourState.completedTours.includes(tourId)
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};
