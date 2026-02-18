import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// LocalStorage keys
const TOUR_COMPLETED_KEY = 'lince_tours_completed';
const TOUR_PREFERENCES_KEY = 'lince_tour_preferences';

interface TourPreferences {
  autoStartEnabled: boolean;
  showHelpButton: boolean;
}

interface TourState {
  activeTour: string | null;
  completedTours: string[];
  isRunning: boolean;
  stepIndex: number;
  tourPreferences: TourPreferences;
}

// Load state from localStorage
const loadCompletedTours = (): string[] => {
  try {
    const stored = localStorage.getItem(TOUR_COMPLETED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const loadTourPreferences = (): TourPreferences => {
  try {
    const stored = localStorage.getItem(TOUR_PREFERENCES_KEY);
    return stored ? JSON.parse(stored) : {
      autoStartEnabled: true,
      showHelpButton: true
    };
  } catch {
    return {
      autoStartEnabled: true,
      showHelpButton: true
    };
  }
};

// Save to localStorage
const saveCompletedTours = (tours: string[]) => {
  try {
    localStorage.setItem(TOUR_COMPLETED_KEY, JSON.stringify(tours));
  } catch (error) {
    console.error('Failed to save completed tours:', error);
  }
};

const saveTourPreferences = (preferences: TourPreferences) => {
  try {
    localStorage.setItem(TOUR_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save tour preferences:', error);
  }
};

const initialState: TourState = {
  activeTour: null,
  completedTours: loadCompletedTours(),
  isRunning: false,
  stepIndex: 0,
  tourPreferences: loadTourPreferences()
};

const tourSlice = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    startTour: (state, action: PayloadAction<string>) => {
      state.activeTour = action.payload;
      state.isRunning = true;
      state.stepIndex = 0;
    },
    stopTour: (state) => {
      state.activeTour = null;
      state.isRunning = false;
      state.stepIndex = 0;
    },
    completeTour: (state, action: PayloadAction<string>) => {
      const tourId = action.payload;
      if (!state.completedTours.includes(tourId)) {
        state.completedTours.push(tourId);
        saveCompletedTours(state.completedTours);
      }
      state.activeTour = null;
      state.isRunning = false;
      state.stepIndex = 0;
    },
    resetTour: (state, action: PayloadAction<string>) => {
      const tourId = action.payload;
      state.completedTours = state.completedTours.filter(id => id !== tourId);
      saveCompletedTours(state.completedTours);
    },
    setStepIndex: (state, action: PayloadAction<number>) => {
      state.stepIndex = action.payload;
    },
    nextStep: (state) => {
      state.stepIndex += 1;
    },
    previousStep: (state) => {
      if (state.stepIndex > 0) {
        state.stepIndex -= 1;
      }
    },
    setTourPreferences: (state, action: PayloadAction<Partial<TourPreferences>>) => {
      state.tourPreferences = {
        ...state.tourPreferences,
        ...action.payload
      };
      saveTourPreferences(state.tourPreferences);
    },
    resetAllTours: (state) => {
      state.completedTours = [];
      saveCompletedTours([]);
      state.activeTour = null;
      state.isRunning = false;
      state.stepIndex = 0;
    }
  }
});

export const {
  startTour,
  stopTour,
  completeTour,
  resetTour,
  setStepIndex,
  nextStep,
  previousStep,
  setTourPreferences,
  resetAllTours
} = tourSlice.actions;

export default tourSlice.reducer;
