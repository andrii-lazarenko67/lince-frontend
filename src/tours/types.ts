import type { Step as JoyrideStep, Placement } from 'react-joyride';

/**
 * Tour step definition with translation keys
 */
export interface TourStep {
  /** CSS selector for the target element */
  target: string;
  /** Translation key for step title */
  titleKey: string;
  /** Translation key for step content */
  contentKey: string;
  /** Placement of the tooltip relative to target */
  placement?: Placement;
  /** Additional padding around spotlight */
  spotlightPadding?: number;
  /** Disable interaction with target element */
  disableInteraction?: boolean;
  /** Callback before showing this step */
  beforeStep?: () => void | Promise<void>;
  /** Callback after leaving this step */
  afterStep?: () => void | Promise<void>;
}

/**
 * Tour category for grouping tours
 */
export type TourCategory = 'operations' | 'management' | 'administration';

/**
 * User role types
 */
export type UserRole = 'admin' | 'manager' | 'operator';

/**
 * Complete tour configuration
 */
export interface TourConfig {
  /** Unique tour identifier */
  id: string;
  /** Translation key for tour name */
  nameKey: string;
  /** Translation key for tour description */
  descriptionKey: string;
  /** Category for grouping */
  category: TourCategory;
  /** Roles that can access this tour */
  roles?: UserRole[];
  /** Tour steps */
  steps: TourStep[];
  /** Page route this tour belongs to */
  page?: string;
}

/**
 * React-joyride compatible step (with translated content)
 */
export interface TranslatedStep extends Omit<JoyrideStep, 'title' | 'content'> {
  title: string;
  content: string;
}

/**
 * Tour progress information
 */
export interface TourProgress {
  totalTours: number;
  completedTours: number;
  percentage: number;
  byCategory: {
    operations: { total: number; completed: number };
    management: { total: number; completed: number };
    administration: { total: number; completed: number };
  };
}
