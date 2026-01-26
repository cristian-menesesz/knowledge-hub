/**
 * Design Tokens - Breakpoints
 *
 * Responsive design breakpoints
 */

export const breakpoints = {
  xs: '320px', // Mobile S
  sm: '640px', // Mobile L / Tablet
  md: '768px', // Tablet
  lg: '1024px', // Laptop
  xl: '1280px', // Desktop
  '2xl': '1536px', // Large Desktop
} as const;

export type BreakpointToken = typeof breakpoints;
