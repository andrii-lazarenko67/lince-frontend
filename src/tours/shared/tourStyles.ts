import type { Styles } from 'react-joyride';

/**
 * Custom Joyride styles matching LINCE theme
 * Primary color: Blue (#3b82f6)
 * Gradients and modern design
 */
export const tourStyles: Styles = {
  options: {
    arrowColor: '#ffffff',
    backgroundColor: '#ffffff',
    overlayColor: 'rgba(0, 0, 0, 0.2)', // Dark overlay on background
    primaryColor: '#3b82f6',
    textColor: '#1f2937',
    width: 400,
    zIndex: 10000
  },
  tooltip: {
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    padding: 0
  },
  tooltipContainer: {
    textAlign: 'left'
  },
  tooltipTitle: {
    color: '#111827',
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
    padding: '20px 24px 12px'
  },
  tooltipContent: {
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '1.6',
    padding: '0 24px 20px'
  },
  tooltipFooter: {
    marginTop: 0,
    padding: '12px 24px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #e5e7eb'
  },
  tooltipFooterSpacer: {
    flex: 1
  },
  buttonNext: {
    backgroundColor: '#3b82f6',
    borderRadius: '6px',
    border: 'none',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    outline: 'none'
  },
  buttonBack: {
    backgroundColor: 'transparent',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 16px',
    marginRight: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none'
  },
  buttonSkip: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 12px',
    cursor: 'pointer',
    marginRight: 'auto',
    outline: 'none'
  },
  buttonClose: {
    color: '#9ca3af',
    height: '16px',
    padding: '20px',
    position: 'absolute',
    right: '8px',
    top: '8px',
    width: '16px',
    cursor: 'pointer',
    outline: 'none'
  },
  overlay: {
    mixBlendMode: 'normal',
    cursor: 'default'
  },
  spotlight: {
    borderRadius: '4px',
    border: '3px solid #a039ff', // Purple border - high contrast
    backgroundColor: 'transparent', // Keep element visible
    animation: 'tourSpotlightReveal 0.4s ease-out',
    boxShadow: '0 0 20px rgba(128, 57, 255, 0.5)'
  },
  beacon: {
    display: 'none' // We disable beacons
  },
  beaconInner: {
    display: 'none'
  },
  beaconOuter: {
    display: 'none'
  },
  // Legacy properties (required by type definition)
  overlayLegacy: {},
  overlayLegacyCenter: {},
  spotlightLegacy: {}
};
