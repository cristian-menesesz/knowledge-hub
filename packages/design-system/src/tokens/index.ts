/**
 * Design Tokens - Main Export
 *
 * Central export for all design tokens
 */

import { colors, type ColorToken } from './colors';
import { typography, type TypographyToken } from './typography';
import {
  spacing,
  spacingPresets,
  type SpacingToken,
  type SpacingPreset,
} from './spacing';
import { borderRadius, type BorderRadiusToken } from './border-radius';
import { shadows, type ShadowToken } from './shadows';
import { zIndex, type ZIndexToken } from './z-index';
import { animation, type AnimationToken } from './animation';
import { breakpoints, type BreakpointToken } from './breakpoints';

// Re-export individual tokens
export {
  colors,
  typography,
  spacing,
  spacingPresets,
  borderRadius,
  shadows,
  zIndex,
  animation,
  breakpoints,
};

// Re-export types
export type {
  ColorToken,
  TypographyToken,
  SpacingToken,
  SpacingPreset,
  BorderRadiusToken,
  ShadowToken,
  ZIndexToken,
  AnimationToken,
  BreakpointToken,
};

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
