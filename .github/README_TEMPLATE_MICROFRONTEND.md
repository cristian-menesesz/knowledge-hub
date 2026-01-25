# [Microfrontend Name]

> **Status**: 🔄 In Development | ✅ Stable | ⚠️ Experimental  
> **Version**: 0.1.0  
> **Maintainer**: @cristian-menesesz

## 📋 Overview

Brief description of what this microfrontend does and its role in the Knowledge Hub platform.

## 🏗️ Architecture

- **Type**: Microfrontend (Module Federation)
- **Framework**: React 18
- **Build Tool**: Webpack 5 | Rspack
- **Exposed Modules**: `./App`, `./Components`
- **Remote URL**: `http://localhost:3001/remoteEntry.js`

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# From monorepo root
npm install

# Run this microfrontend in development mode
npm run dev --workspace=@knowledge-hub/[mfe-name]
```

### Environment Variables

Copy `.env.example` to `.env`:

```env
# Required
NODE_ENV=development
PORT=3001
API_GATEWAY_URL=http://localhost:8080

# Optional
PUBLIC_PATH=http://localhost:3001/
ENABLE_ANALYTICS=false
```

## 📁 Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # Reusable UI components
│   └── features/    # Feature-specific components
├── hooks/           # Custom React hooks
├── pages/           # Page components (routes)
├── store/           # Redux/Zustand store
├── api/             # API client functions
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── styles/          # Global styles
├── App.tsx          # Main app component
└── bootstrap.tsx    # Module Federation bootstrap
```

## 🔌 Exposed Components

This microfrontend exposes the following modules via Module Federation:

### ./App

Main application component that can be consumed by the shell.

```tsx
import React from 'react';
const App = React.lazy(() => import('[mfe-name]/App'));

function Shell() {
  return (
    <React.Suspense fallback={<Loading />}>
      <App />
    </React.Suspense>
  );
}
```

### ./Components

Shared components for other microfrontends.

```tsx
import { Button, Card } from '[mfe-name]/Components';
```

## 🎨 Design System Integration

This microfrontend uses the shared design system:

```tsx
import { Button, Input, Card } from '@knowledge-hub/design-system';
import { useTheme } from '@knowledge-hub/design-system/hooks';
```

## 🧪 Testing

```bash
# Run all tests
npm run test --workspace=@knowledge-hub/[mfe-name]

# Run with watch mode
npm run test:watch --workspace=@knowledge-hub/[mfe-name]

# Run with coverage
npm run test:coverage --workspace=@knowledge-hub/[mfe-name]

# Run E2E tests
npm run test:e2e --workspace=@knowledge-hub/[mfe-name]
```

## 🏃 Running

### Development Mode (Standalone)

```bash
npm run dev --workspace=@knowledge-hub/[mfe-name]
# Access at http://localhost:3001
```

### Development Mode (Integrated with Shell)

```bash
# Run shell
npm run dev --workspace=@knowledge-hub/shell

# Run this microfrontend
npm run dev --workspace=@knowledge-hub/[mfe-name]

# Access shell at http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build --workspace=@knowledge-hub/[mfe-name]

# Preview production build
npm run preview --workspace=@knowledge-hub/[mfe-name]
```

## 📦 Module Federation Configuration

### Webpack Config

```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: '[mfe-name]',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',
    './Components': './src/components/index',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
    'react-router-dom': { singleton: true },
  },
});
```

## 🔒 Security

- **CSP**: Content Security Policy headers configured
- **XSS Protection**: Input sanitization with DOMPurify
- **Authentication**: JWT tokens via API Gateway
- **CORS**: Configured for Module Federation

## 🎯 Features

List key features of this microfrontend:

- [ ] Feature 1 - Description
- [ ] Feature 2 - Description
- [ ] Feature 3 - Description

## 📊 State Management

### Redux Toolkit (if applicable)

```tsx
import { useAppSelector, useAppDispatch } from './store/hooks';
import { selectUser, fetchUser } from './store/slices/userSlice';

function Component() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  useEffect(() => {
    dispatch(fetchUser());
  }, []);
}
```

### React Query (for server state)

```tsx
import { useQuery } from '@tanstack/react-query';
import { fetchContent } from './api/content';

function Component() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['content', id],
    queryFn: () => fetchContent(id),
  });
}
```

## 🌐 Routing

This microfrontend uses React Router for internal routing:

```tsx
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detail/:id" element={<Detail />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

## 🎨 Styling

- **CSS Modules**: Component-scoped styles
- **Design Tokens**: Via `@knowledge-hub/design-system`
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: Theme-aware components

```tsx
import styles from './Component.module.css';

function Component() {
  return <div className={styles.container}>Content</div>;
}
```

## ♿ Accessibility

- **WCAG 2.1 AA Compliance**: Minimum standard
- **Keyboard Navigation**: All interactive elements
- **Screen Reader Support**: ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Color Contrast**: AAA rating for text

## 📚 Documentation

- **Component Storybook**: [http://localhost:6006](http://localhost:6006)
- **Architecture Docs**: [docs/microfrontends/[mfe-name].md](../../docs/microfrontends/)

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

### Component Development

1. Create component in `src/components/`
2. Add tests in `src/components/__tests__/`
3. Add stories in `src/components/Component.stories.tsx`
4. Export from `src/components/index.ts` if shared

## 📝 License

MIT License - See [LICENSE](../../LICENSE) for details

## 🆘 Troubleshooting

### Module Federation Issues

**Problem**: "Shared module not available for eager consumption"

```javascript
// Wrap your app bootstrap
import('./bootstrap');
```

**Problem**: Version conflicts in shared modules

- Check webpack config shared dependencies
- Ensure singleton: true for React/React-DOM
- Clear node_modules and reinstall

### Build Issues

**Problem**: "Module not found" errors

- Check import paths are correct
- Verify exports in package.json
- Run `npm run typecheck` for TypeScript errors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/cristian-menesesz/knowledge-hub/issues)
- **Discussions**:
  [GitHub Discussions](https://github.com/cristian-menesesz/knowledge-hub/discussions)

---

**Last Updated**: January 25, 2026
