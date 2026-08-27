// Spacing system based on 8px grid
export const spacing = {
  none: '0px',
  xs: '4px',    // 0.5rem (relative values)
  sm: '8px',    // 1rem base unit
  md: '16px',   // 2rem base unit
  lg: '24px',   // 3rem base unit
  xl: '32px',   // 4rem base unit
  xxl: '48px',  // 6rem base unit
  xxxl: '64px', // 8rem base unit
  
  // Tailwind mapping equivalents
  classes: {
    padding: {
      xs: 'p-1',   // 4px
      sm: 'p-2',   // 8px
      md: 'p-4',   // 16px
      lg: 'p-6',   // 24px
      xl: 'p-8',   // 32px
      xxl: 'p-12', // 48px
    },
    margin: {
      xs: 'm-1',
      sm: 'm-2',
      md: 'm-4',
      lg: 'm-6',
      xl: 'm-8',
      xxl: 'm-12',
    },
    gap: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    }
  }
};
