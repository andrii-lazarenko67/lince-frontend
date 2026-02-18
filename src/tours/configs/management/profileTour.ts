import type { TourConfig } from '../../types';
import { PROFILE_TOUR } from '../../constants';

/**
 * Profile page tour
 * Guides users through their profile management and password settings
 */
export const profileTour: TourConfig = {
  id: PROFILE_TOUR,
  nameKey: 'tours.profile.title',
  descriptionKey: 'tours.profile.description',
  category: 'management',
  roles: ['admin', 'manager', 'operator'],
  page: '/profile',
  steps: [
    {
      target: 'body',
      titleKey: 'tours.profile.steps.welcome.title',
      contentKey: 'tours.profile.steps.welcome.content',
      disableInteraction: true
    },
    {
      target: '[data-tour="profile-header"]',
      titleKey: 'tours.profile.steps.header.title',
      contentKey: 'tours.profile.steps.header.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="profile-info"]',
      titleKey: 'tours.profile.steps.profileInfo.title',
      contentKey: 'tours.profile.steps.profileInfo.content',
      placement: 'right'
    },
    {
      target: '[data-tour="avatar-upload"]',
      titleKey: 'tours.profile.steps.avatar.title',
      contentKey: 'tours.profile.steps.avatar.content',
      placement: 'bottom'
    },
    {
      target: '[data-tour="user-details"]',
      titleKey: 'tours.profile.steps.details.title',
      contentKey: 'tours.profile.steps.details.content',
      placement: 'top'
    },
    {
      target: '[data-tour="edit-profile-button"]',
      titleKey: 'tours.profile.steps.editButton.title',
      contentKey: 'tours.profile.steps.editButton.content',
      placement: 'top'
    },
    {
      target: '[data-tour="password-section"]',
      titleKey: 'tours.profile.steps.password.title',
      contentKey: 'tours.profile.steps.password.content',
      placement: 'left'
    },
    {
      target: 'body',
      titleKey: 'tours.profile.steps.complete.title',
      contentKey: 'tours.profile.steps.complete.content',
      disableInteraction: true
    }
  ]
};
