# Design System Guide

## Architecture

The Knowledge Hub design system follows atomic design principles and is built on top of
industry-standard technologies.

### Technology Stack

- **React 18**: Component library
- **TypeScript 5**: Type safety
- **Radix UI**: Accessible component primitives
- **Tailwind CSS 3**: Utility-first styling
- **CVA**: Variant management
- **Storybook 7**: Component documentation

### Design Philosophy

1. **Accessibility First**: All components meet WCAG 2.1 AA standards
2. **Composable**: Components are designed to work together
3. **Consistent**: Unified design language across all components
4. **Performant**: Tree-shakeable and optimized for production
5. **Developer Experience**: TypeScript types and comprehensive docs

## Design Tokens

Design tokens are the foundation of the design system. They ensure consistency across all components
and applications.

### Token Categories

#### 1. Colors

```typescript
import { tokens } from '@knowledge-hub/design-system/tokens';

// Brand colors
tokens.colors.brand.primary[500]; // #0EA5E9
tokens.colors.brand.secondary[500]; // #A855F7

// Semantic colors
tokens.colors.semantic.success[500]; // #10B981
tokens.colors.semantic.warning[500]; // #F59E0B
tokens.colors.semantic.error[500]; // #EF4444
tokens.colors.semantic.info[500]; // #3B82F6

// Neutral colors
tokens.colors.neutral[900]; // #171717 (darkest)
tokens.colors.neutral[50]; // #FAFAFA (lightest)
```

**Usage Guidelines:**

- Use brand colors for primary actions and branding
- Use semantic colors to communicate status (success, error, etc.)
- Use neutral colors for text, borders, and backgrounds
- Maintain 4.5:1 contrast ratio for text (WCAG AA)

#### 2. Typography

```typescript
// Font families
tokens.typography.fontFamily.sans; // "Inter, system-ui, sans-serif"
tokens.typography.fontFamily.mono; // "JetBrains Mono, monospace"

// Font sizes
tokens.typography.fontSize.xs; // "12px"
tokens.typography.fontSize.base; // "16px"
tokens.typography.fontSize['4xl']; // "36px"

// Text styles (presets)
tokens.typography.textStyles.h1; // { fontSize: 48px, fontWeight: 700, ... }
tokens.typography.textStyles.body; // { fontSize: 16px, fontWeight: 400, ... }
```

**Typography Scale:**

- **Display**: 48px+ (h1, h2)
- **Heading**: 24-36px (h3, h4)
- **Body**: 14-18px (body, bodyLarge)
- **Small**: 12-14px (caption, label)

**Font Loading:**

Fonts are loaded from Google Fonts. Add to your HTML:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

#### 3. Spacing

```typescript
// Base spacing scale
tokens.spacing[1]; // 4px
tokens.spacing[4]; // 16px
tokens.spacing[8]; // 32px
tokens.spacing[16]; // 64px

// Semantic presets
tokens.spacing.componentPadding.sm; // 8px
tokens.spacing.gap.md; // 16px
tokens.spacing.section.lg; // 128px
```

**Spacing Guidelines:**

- Use multiples of 4px (0.25rem) for consistency
- Use semantic presets when available
- Component padding: sm (8px), md (16px), lg (24px)
- Gap between elements: xs (4px), sm (8px), md (16px)

#### 4. Border Radius

```typescript
tokens.borderRadius.none; // 0px
tokens.borderRadius.sm; // 4px
tokens.borderRadius.md; // 8px
tokens.borderRadius.lg; // 12px
tokens.borderRadius.full; // 9999px (circle)
```

#### 5. Shadows

```typescript
tokens.shadows.sm; // Subtle elevation
tokens.shadows.md; // Default elevation
tokens.shadows.lg; // Prominent elevation
tokens.shadows.focusPrimary; // Focus ring
```

#### 6. Animation

```typescript
// Duration
tokens.animation.duration.fast; // 150ms
tokens.animation.duration.normal; // 200ms
tokens.animation.duration.slow; // 300ms

// Easing
tokens.animation.easing.easeOut; // cubic-bezier(0, 0, 0.2, 1)
tokens.animation.easing.spring; // cubic-bezier(0.34, 1.56, 0.64, 1)

// Keyframes
tokens.animation.keyframes.fadeIn;
tokens.animation.keyframes.slideInUp;
```

## Component Patterns

### Composition Pattern

Components are designed to be composed together:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <Input label="Name" />
  </CardContent>
  <CardFooter>
    <Button>Submit</Button>
  </CardFooter>
</Card>
```

### Variant Pattern

Components support multiple variants for different use cases:

```tsx
// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>

// Badge variants
<Badge variant="success">Success</Badge>
<Badge variant="error">Error</Badge>
```

### Polymorphic Pattern

Some components support `asChild` prop (Radix Slot) for polymorphism:

```tsx
// Render as anchor tag
<Button asChild>
  <a href="/link">Go to page</a>
</Button>

// Render as Next.js Link
<Button asChild>
  <Link href="/link">Go to page</Link>
</Button>
```

### Controlled vs Uncontrolled

Components support both controlled and uncontrolled modes:

```tsx
// Uncontrolled
<Input defaultValue="initial" />;

// Controlled
const [value, setValue] = useState('');
<Input value={value} onChange={(e) => setValue(e.target.value)} />;
```

## Accessibility Guidelines

### Keyboard Navigation

All interactive components support keyboard navigation:

- **Tab**: Move focus
- **Shift + Tab**: Move focus backward
- **Enter/Space**: Activate button/checkbox
- **Escape**: Close dialog/toast
- **Arrow keys**: Navigate tabs/select options

### ARIA Attributes

Components automatically include appropriate ARIA attributes:

```tsx
// Input with error
<Input
  label="Email"
  error="Invalid email"
  // Automatically includes:
  // aria-invalid="true"
  // aria-describedby="error-id"
/>

// Button loading state
<Button isLoading>
  Submit
  {
    /* Automatically includes:
   * aria-busy="true"
   * aria-disabled="true"
   */
  }
</Button>
```

### Focus Management

- Visible focus indicators on all interactive elements
- Focus rings use primary color with 2px offset
- Focus is trapped in modals (Dialog component)
- Focus returns to trigger element when closing

### Color Contrast

- Text: 4.5:1 minimum (WCAG AA)
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum
- Verified in Storybook with a11y addon

## Responsive Design

### Breakpoint System

```typescript
tokens.breakpoints.xs; // 320px
tokens.breakpoints.sm; // 640px
tokens.breakpoints.md; // 768px
tokens.breakpoints.lg; // 1024px
tokens.breakpoints.xl; // 1280px
tokens.breakpoints['2xl']; // 1536px
```

### Mobile-First Approach

Use Tailwind's responsive modifiers:

```tsx
<div className="px-4 sm:px-6 md:px-8 lg:px-12">
  <Button className="w-full sm:w-auto">Responsive Button</Button>
</div>
```

## Dark Mode

### Implementation

Dark mode is controlled via the `dark` class on the root element:

```tsx
// Toggle dark mode
const [isDark, setIsDark] = useState(false);

useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDark]);
```

### Color Tokens

CSS variables automatically switch in dark mode:

```css
:root {
  --background: 0 0% 100%; /* white */
  --foreground: 0 0% 9%; /* dark gray */
}

.dark {
  --background: 0 0% 9%; /* dark gray */
  --foreground: 0 0% 98%; /* near white */
}
```

## Testing

### Unit Testing

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@knowledge-hub/design-system';

test('button handles click', async () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  await userEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('button has no a11y violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Performance

### Tree Shaking

Import only what you need:

```tsx
// ✅ Good - tree-shakeable
import { Button, Input } from '@knowledge-hub/design-system';

// ❌ Bad - imports everything
import * as DesignSystem from '@knowledge-hub/design-system';
```

### Bundle Size

Component bundle sizes (gzipped):

- Button: ~2KB
- Input: ~3KB
- Dialog: ~8KB (includes overlay, animation)
- Toast: ~10KB (includes provider, queue)

### Code Splitting

Use dynamic imports for large components:

```tsx
import { lazy, Suspense } from 'react';

const Dialog = lazy(() =>
  import('@knowledge-hub/design-system').then((m) => ({ default: m.Dialog }))
);

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dialog>...</Dialog>
    </Suspense>
  );
}
```

## Migration Guide

### From Custom Components

Replace custom components with design system equivalents:

```tsx
// Before
<CustomButton className="btn-primary" onClick={handleClick}>
  Submit
</CustomButton>

// After
<Button variant="primary" onClick={handleClick}>
  Submit
</Button>
```

### From Other Design Systems

Mapping common component names:

- `<Btn>` → `<Button>`
- `<TextField>` → `<Input>`
- `<Panel>` → `<Card>`
- `<Tag>` → `<Badge>`
- `<Modal>` → `<Dialog>`
- `<Notification>` → `<Toast>`

## Best Practices

### Component Usage

1. **Use semantic HTML**: Components render proper semantic elements
2. **Provide labels**: Always include labels for form inputs
3. **Handle loading states**: Use `isLoading` prop on buttons
4. **Show errors**: Display validation errors with `error` prop
5. **Support keyboard**: Test all interactions with keyboard only

### Styling

1. **Use design tokens**: Reference tokens instead of hardcoding values
2. **Compose utilities**: Combine Tailwind classes with `cn()` utility
3. **Avoid inline styles**: Use className with Tailwind utilities
4. **Follow conventions**: Use existing component variants when possible

### Accessibility

1. **Test with keyboard**: Navigate without mouse
2. **Test with screen reader**: Use NVDA/JAWS/VoiceOver
3. **Check color contrast**: Use tools like Stark or axe DevTools
4. **Provide alternatives**: Include alt text, ARIA labels
5. **Manage focus**: Ensure logical focus order

## Resources

- [Radix UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Aria Documentation](https://react-spectrum.adobe.com/react-aria/)
- [Inclusive Components](https://inclusive-components.design/)
