# Knowledge Hub Design System

A comprehensive design system built with React, TypeScript, Radix UI, and Tailwind CSS.

## Overview

The Knowledge Hub design system provides a complete set of reusable components, design tokens, and
utilities for building consistent, accessible user interfaces across the Knowledge Hub platform.

## Features

- 🎨 **Design Tokens**: Complete token system (colors, typography, spacing, etc.)
- ♿ **Accessibility**: Built on Radix UI primitives with WCAG 2.1 AA compliance
- 🎯 **TypeScript**: Fully typed with strict TypeScript
- 📚 **Storybook**: Interactive component documentation
- 🌗 **Dark Mode**: Built-in dark mode support
- 🧪 **Tested**: Unit and accessibility tests included
- 📦 **Tree-shakeable**: Optimized bundle size

## Installation

```bash
npm install @knowledge-hub/design-system
```

## Usage

### Importing Styles

Import the design system styles in your app entry point:

```tsx
import '@knowledge-hub/design-system/dist/styles.css';
```

### Using Components

```tsx
import { Button, Input, Card } from '@knowledge-hub/design-system';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Get started with the design system</CardDescription>
      </CardHeader>
      <CardContent>
        <Input label="Email" type="email" placeholder="you@example.com" />
      </CardContent>
      <CardFooter>
        <Button>Submit</Button>
      </CardFooter>
    </Card>
  );
}
```

### Using Design Tokens

```tsx
import { tokens } from '@knowledge-hub/design-system/tokens';

// Access color tokens
const primaryColor = tokens.colors.brand.primary[500]; // #0EA5E9

// Access typography tokens
const heading1 = tokens.typography.textStyles.h1; // { fontSize, fontWeight, lineHeight }

// Access spacing tokens
const spacing = tokens.spacing[4]; // 16px
```

## Components

### Core Components

- **Button**: Interactive button with multiple variants and sizes
- **Input**: Form input with label, validation, and icons
- **Card**: Content container with header, content, and footer
- **Badge**: Status indicator with variants
- **Avatar**: User profile image with status indicator
- **Checkbox**: Accessible checkbox with label

### Overlay Components

- **Dialog**: Modal dialog with overlay
- **Toast**: Notification toast with variants
- **Tabs**: Tabbed content switcher

## Design Tokens

### Colors

- **Brand**: Primary (blue), Secondary (purple)
- **Semantic**: Success, Warning, Error, Info
- **Neutral**: Gray scale (50-950)
- **Special**: Overlay, backdrop

### Typography

- **Font Families**: Sans (Inter), Serif (Merriweather), Mono (JetBrains Mono), Display (Cal Sans)
- **Font Sizes**: xs (12px) to 9xl (128px)
- **Text Styles**: h1-h6, body variants, caption, code, label, button

### Spacing

- **Base Scale**: 0 to 96 (0px to 384px)
- **Semantic Presets**: componentPadding, gap, section, container

### Other Tokens

- **Border Radius**: none to full (0 to 9999px)
- **Shadows**: xs to 2xl with focus variants
- **Z-Index**: Layering system (base to toast)
- **Animation**: Duration, easing, transitions, keyframes
- **Breakpoints**: xs (320px) to 2xl (1536px)

## Accessibility

All components are built with accessibility in mind:

- Keyboard navigation support
- Screen reader friendly with ARIA attributes
- Focus management and visible focus indicators
- Color contrast compliance (WCAG 2.1 AA)
- Semantic HTML structure

## Dark Mode

The design system supports dark mode out of the box. Toggle dark mode by adding the `dark` class to
your root element:

```tsx
<html className="dark">
  <body>{/* Your app */}</body>
</html>
```

## Customization

### Extending Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';
import designSystemConfig from '@knowledge-hub/design-system/tailwind.config';

const config: Config = {
  presets: [designSystemConfig],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@knowledge-hub/design-system/dist/**/*.js',
  ],
  // Your custom configuration
};

export default config;
```

### Custom Theme

Override CSS variables to customize the theme:

```css
:root {
  --primary: 199 89% 48%;
  --secondary: 270 91% 60%;
  /* ... other variables */
}
```

## Development

### Running Storybook

```bash
npm run storybook
```

### Building the Package

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## License

MIT © Knowledge Hub

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## Resources

- [Storybook Documentation](https://storybook.js.org/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
