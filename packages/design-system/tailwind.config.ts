import type { Config } from 'tailwindcss';
import { tokens } from './src/tokens';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: tokens.colors.brand.primary[500],
          ...tokens.colors.brand.primary,
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: tokens.colors.brand.secondary[500],
          ...tokens.colors.brand.secondary,
          foreground: '#ffffff',
        },

        // Semantic colors
        success: {
          DEFAULT: tokens.colors.semantic.success[500],
          ...tokens.colors.semantic.success,
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: tokens.colors.semantic.warning[500],
          ...tokens.colors.semantic.warning,
          foreground: '#000000',
        },
        error: {
          DEFAULT: tokens.colors.semantic.error[500],
          ...tokens.colors.semantic.error,
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: tokens.colors.semantic.error[500],
          ...tokens.colors.semantic.error,
          foreground: '#ffffff',
        },
        info: {
          DEFAULT: tokens.colors.semantic.info[500],
          ...tokens.colors.semantic.info,
          foreground: '#ffffff',
        },

        // Neutral colors
        background: 'hsl(0 0% 100%)',
        foreground: tokens.colors.neutral[900],
        card: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: tokens.colors.neutral[900],
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%)',
          foreground: tokens.colors.neutral[900],
        },
        muted: {
          DEFAULT: tokens.colors.neutral[100],
          foreground: tokens.colors.neutral[600],
        },
        accent: {
          DEFAULT: tokens.colors.neutral[100],
          foreground: tokens.colors.neutral[900],
        },
        border: tokens.colors.neutral[200],
        input: tokens.colors.neutral[300],
        ring: tokens.colors.brand.primary[500],
      },

      fontFamily: {
        sans: tokens.typography.fontFamily.sans.split(', '),
        serif: tokens.typography.fontFamily.serif.split(', '),
        mono: tokens.typography.fontFamily.mono.split(', '),
        display: tokens.typography.fontFamily.display.split(', '),
      },

      fontSize: tokens.typography.fontSize,
      fontWeight: tokens.typography.fontWeight,
      lineHeight: tokens.typography.lineHeight,
      letterSpacing: tokens.typography.letterSpacing,

      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.shadows,
      zIndex: tokens.zIndex,

      transitionDuration: tokens.animation.duration,
      transitionTimingFunction: tokens.animation.easing,

      screens: tokens.breakpoints,

      keyframes: tokens.animation.keyframes,

      animation: {
        fadeIn: 'fadeIn 200ms ease-out',
        fadeOut: 'fadeOut 200ms ease-in',
        slideInUp: 'slideInUp 200ms ease-out',
        slideInDown: 'slideInDown 200ms ease-out',
        scaleIn: 'scaleIn 200ms ease-out',
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
