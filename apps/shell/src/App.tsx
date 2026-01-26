import * as React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { PageLoadingFallback } from '@/components/Loading';
import { router } from '@/routes';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <RouterProvider
        router={router}
        fallbackElement={<PageLoadingFallback />}
      />
    </ErrorBoundary>
  );
};
