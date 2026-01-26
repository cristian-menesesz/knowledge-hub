/**
 * Design Tokens - Main Export
 *
 * Central export for all design tokens
 */

export { colors, type ColorToken } from './colors';
export { typography, type TypographyToken } from './typography';
export {
  spacing,
  spacingPresets,
  type SpacingToken,
  type SpacingPreset,
} from './spacing';
export { borderRadius, type BorderRadiusToken } from './border-radius';
export { shadows, type ShadowToken } from './shadows';
export { zIndex, type ZIndexToken } from './z-index';
export { animation, type AnimationToken } from './animation';
export { breakpoints, type BreakpointToken } from './breakpoints';

// Combined tokens object
export const tokens = {
  colors,
  typography,
  spacing,
  spacingPresets,
  borderRadius,
  shadows,
  zIndex,
  animation,
  breakpoints,
} as const;

export type DesignTokens = typeof tokens;
