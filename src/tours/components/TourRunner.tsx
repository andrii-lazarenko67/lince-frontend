import React, { useCallback, useEffect, useState } from 'react';
import Joyride, { STATUS, EVENTS, ACTIONS } from 'react-joyride';
import type { Step, CallBackProps } from 'react-joyride';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { stopTour, completeTour, setStepIndex } from '../../store/slices/tourSlice';
import type { TourConfig } from '../types';
import { tourStyles } from '../shared/tourStyles';
import '../shared/tourAnimations.css';

interface TourRunnerProps {
  tours: TourConfig[];
}

export const TourRunner: React.FC<TourRunnerProps> = ({ tours }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { activeTour, isRunning, stepIndex } = useAppSelector((state) => state.tour);
  const [steps, setSteps] = useState<Step[]>([]);

  // Find active tour configuration
  const activeTourConfig = tours.find(tour => tour.id === activeTour);

  // Translate tour steps
  useEffect(() => {
    if (activeTourConfig) {
      const translatedSteps: Step[] = activeTourConfig.steps.map((step) => ({
        target: step.target,
        title: t(step.titleKey),
        content: t(step.contentKey),
        placement: step.placement || 'auto',
        spotlightPadding: step.spotlightPadding,
        disableBeacon: true, // Don't show beacon, start tour immediately
        ...(step.disableInteraction && { disableInteraction: true })
      }));
      setSteps(translatedSteps);
    } else {
      setSteps([]);
    }
  }, [activeTourConfig, t]);

  // Handle tour callbacks
  const handleCallback = useCallback(
    async (data: CallBackProps) => {
      const { status, action, index, type } = data;

      // Execute beforeStep callback if exists
      if (
        type === EVENTS.STEP_BEFORE &&
        activeTourConfig?.steps[index]?.beforeStep
      ) {
        await activeTourConfig.steps[index].beforeStep!();
      }

      // Execute afterStep callback if exists
      if (
        type === EVENTS.STEP_AFTER &&
        activeTourConfig?.steps[index]?.afterStep
      ) {
        await activeTourConfig.steps[index].afterStep!();
      }

      // Update step index in Redux
      if (type === EVENTS.STEP_AFTER) {
        dispatch(setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1)));
      }

      // Handle tour completion or skip
      if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        if (activeTour) {
          if (status === STATUS.FINISHED) {
            dispatch(completeTour(activeTour));
          } else {
            dispatch(stopTour());
          }
        }
      }

      // Handle close button click
      if (action === ACTIONS.CLOSE) {
        dispatch(stopTour());
      }
    },
    [activeTour, activeTourConfig, dispatch]
  );

  if (!isRunning || !activeTourConfig || steps.length === 0) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={isRunning}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      callback={handleCallback}
      locale={{
        back: t('tours.common.back'),
        close: t('tours.common.close'),
        last: t('tours.common.finish'),
        next: t('tours.common.next'),
        skip: t('tours.common.skip')
      }}
      styles={tourStyles}
    />
  );
};
