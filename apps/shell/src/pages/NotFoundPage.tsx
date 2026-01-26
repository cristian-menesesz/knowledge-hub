/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Temporarily disabled due to missing design system type declarations
import * as React from 'react';
import { Link } from 'react-router-dom';
// @ts-expect-error - Design system types not available without DTS build
import { Button } from '@knowledge-hub/design-system';
import { Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-bold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild leftIcon={<Home className="h-4 w-4" />}>
            <Link to="/">Go Home</Link>
          </Button>
          <Button
            variant="outline"
            asChild
            leftIcon={<Search className="h-4 w-4" />}
          >
            <Link to="/search">Search Content</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
