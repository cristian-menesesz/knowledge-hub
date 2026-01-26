import * as React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoadingFallback } from '@/components/Loading';

// Lazy load future microfrontends
// These will be replaced with actual remote module imports when MFEs are ready

// Placeholder components for future routes
const BrowsePage = React.lazy(() =>
  Promise.resolve({
    default: () => (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Browse Content</h1>
        <p className="text-muted-foreground">
          Content Reader MFE will be loaded here
        </p>
      </div>
    ),
  })
);

const CreatePage = React.lazy(() =>
  Promise.resolve({
    default: () => (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Create Content</h1>
        <p className="text-muted-foreground">
          Content Editor MFE will be loaded here
        </p>
      </div>
    ),
  })
);

const SearchPage = React.lazy(() =>
  Promise.resolve({
    default: () => (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Search</h1>
        <p className="text-muted-foreground">Search MFE will be loaded here</p>
      </div>
    ),
  })
);

const AdminPage = React.lazy(() =>
  Promise.resolve({
    default: () => (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Admin Dashboard MFE will be loaded here
        </p>
      </div>
    ),
  })
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'browse',
        element: (
          <React.Suspense
            fallback={<LoadingFallback message="Loading content..." />}
          >
            <BrowsePage />
          </React.Suspense>
        ),
      },
      {
        path: 'create',
        element: (
          <React.Suspense
            fallback={<LoadingFallback message="Loading editor..." />}
          >
            <CreatePage />
          </React.Suspense>
        ),
      },
      {
        path: 'search',
        element: (
          <React.Suspense
            fallback={<LoadingFallback message="Loading search..." />}
          >
            <SearchPage />
          </React.Suspense>
        ),
      },
      {
        path: 'admin',
        element: (
          <React.Suspense
            fallback={<LoadingFallback message="Loading admin..." />}
          >
            <AdminPage />
          </React.Suspense>
        ),
      },
      {
        path: '404',
        element: <NotFoundPage />,
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
]);
