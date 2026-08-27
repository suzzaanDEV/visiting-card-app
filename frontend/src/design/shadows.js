// Elevation and shadow styles for Cardly
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Custom shadows for inputs and interactive states
  focus: '0 0 0 3px rgba(4, 120, 87, 0.4)', // Primary color emerald focus ring
  focusDanger: '0 0 0 3px rgba(239, 68, 68, 0.4)', // Danger red focus ring
  
  // Glassmorphic overlays
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
  glassDark: {
    background: 'rgba(15, 23, 42, 0.3)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  }
};
