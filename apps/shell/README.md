# Shell Application (Microfrontend Host)

The shell application is the main entry point and host for the Knowledge Hub microfrontend
architecture.

## Architecture

- **Framework**: React 18 with TypeScript
- **Bundler**: Webpack 5 with Module Federation
- **Routing**: React Router v6
- **Styling**: Tailwind CSS + Design System
- **State**: Context API (global) + Local state

## Module Federation

The shell acts as the **host** application that loads remote microfrontends:

- **Content Reader** (port 3001) - Article reading interface
- **Content Editor** (port 3002) - Block-based content editor
- **Admin Dashboard** (port 3003) - Analytics and management

### Shared Dependencies

All MFEs share the following as **singletons**:

- React 18.3.1
- React DOM 18.3.1
- React Router DOM 6.22.0
- Design System 0.1.0

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

```bash
# From workspace root
npm install

# Or just this package
cd apps/shell
npm install
```

### Development

```bash
# Start dev server on port 3000
npm run dev

# Access the app
# http://localhost:3000
```

### Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### Type Checking

```bash
# Run TypeScript type check
npm run typecheck
```

### Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
apps/shell/
├── public/
│   └── index.html           # HTML template
├── src/
│   ├── components/          # Reusable components
│   │   ├── ErrorBoundary.tsx
│   │   └── Loading.tsx
│   ├── layouts/             # Layout components
│   │   └── MainLayout.tsx
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   └── NotFoundPage.tsx
│   ├── routes/              # Route configuration
│   │   └── index.tsx
│   ├── styles/              # Global styles
│   │   └── globals.css
│   ├── types/               # TypeScript declarations
│   │   └── index.d.ts
│   ├── App.tsx              # Root component
│   └── index.tsx            # Entry point
├── .env.example             # Environment variables template
├── .eslintrc.json           # ESLint configuration
├── package.json             # Package configuration
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── webpack.config.js        # Webpack configuration
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Available Variables

- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Dev server port (default: 3000)
- `CONTENT_READER_URL` - Content Reader MFE URL
- `CONTENT_EDITOR_URL` - Content Editor MFE URL
- `ADMIN_DASHBOARD_URL` - Admin Dashboard MFE URL
- `API_GATEWAY_URL` - API Gateway URL
- `ENABLE_REMOTE_MODULES` - Enable/disable remote module loading

## Features

### Current (Phase 1.5)

- ✅ React 18 with TypeScript
- ✅ Webpack 5 + Module Federation setup
- ✅ Main layout with responsive navigation
- ✅ Dark/light theme toggle
- ✅ React Router v6 with lazy loading
- ✅ Error boundaries
- ✅ Loading states
- ✅ Design System integration
- ✅ Tailwind CSS styling

### Future Phases

- 🔜 Remote module loading (Phase 2+)
- 🔜 Authentication integration (Phase 3)
- 🔜 User profile (Phase 4)
- 🔜 Notifications (Phase 5)
- 🔜 Search integration (Phase 6)

## Navigation

The shell provides the following routes:

- `/` - Home page
- `/browse` - Content browsing (will load Content Reader MFE)
- `/create` - Content creation (will load Content Editor MFE)
- `/search` - Search interface (will load Search MFE)
- `/admin` - Admin dashboard (will load Admin Dashboard MFE)
- `/404` - Not found page

## Design System

The shell uses the shared Design System package:

```tsx
import { Button, ThemeProvider } from '@knowledge-hub/design-system';

// Theme provider wraps the entire app
<ThemeProvider>
  <App />
</ThemeProvider>

// Use design system components
<Button variant="primary" size="md">
  Click me
</Button>
```

## Error Handling

The shell implements error boundaries at multiple levels:

1. **App-level**: Catches all React errors
2. **Route-level**: Catches routing errors
3. **Component-level**: Can be added for specific features

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>;
```

## Loading States

Loading states are provided for various scenarios:

- `LoadingSpinner` - Small inline spinner
- `LoadingFallback` - Component-level loading
- `PageLoadingFallback` - Full page loading

## Module Federation Configuration

See `webpack.config.js` for the complete Module Federation setup.

### Host Configuration

```js
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    contentReader: 'contentReader@http://localhost:3001/remoteEntry.js',
    contentEditor: 'contentEditor@http://localhost:3002/remoteEntry.js',
    adminDashboard: 'adminDashboard@http://localhost:3003/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
    'react-router-dom': { singleton: true },
    '@knowledge-hub/design-system': { singleton: true },
  },
});
```

## Development Tips

### Hot Module Replacement

HMR is enabled in development. Changes to React components will update without full page reload.

### Path Aliases

TypeScript path aliases are configured:

- `@/` - src/
- `@components/` - src/components/
- `@layouts/` - src/layouts/
- `@pages/` - src/pages/
- `@routes/` - src/routes/

```tsx
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@pages/HomePage';
```

### Dark Mode

Dark mode is controlled via:

1. User preference (localStorage)
2. System preference (prefers-color-scheme)
3. Toggle in navigation bar

The theme is applied via Tailwind's `dark:` variant.

## Troubleshooting

### Port Already in Use

If port 3000 is in use:

```bash
# Change PORT in .env
PORT=3001

# Or kill the process using port 3000
```

### Module Not Found

Ensure all dependencies are installed:

```bash
npm install
```

### Type Errors

Run type checking to see all errors:

```bash
npm run typecheck
```

## Contributing

See the root [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## License

This project is part of the Knowledge Hub monorepo.
