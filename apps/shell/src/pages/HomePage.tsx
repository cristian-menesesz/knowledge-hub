import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@knowledge-hub/design-system';
import { BookOpen, PenTool, Search, TrendingUp } from 'lucide-react';

export const HomePage: React.FC = () => {
  const features = [
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Rich Content',
      description:
        'Create and read articles with block-based editor supporting text, code, images, and more.',
    },
    {
      icon: <Search className="h-8 w-8" />,
      title: 'Powerful Search',
      description:
        'Find what you need quickly with full-text search across all content.',
    },
    {
      icon: <PenTool className="h-8 w-8" />,
      title: 'Easy Authoring',
      description:
        'Intuitive editor with live preview and markdown support for seamless content creation.',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Analytics',
      description:
        'Track engagement, views, and user interactions with comprehensive analytics.',
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="space-y-6 py-8 text-center md:py-12 lg:py-16">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your Knowledge,{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Organized
            </span>
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            A modern platform for creating, sharing, and discovering knowledge.
            Built with cutting-edge microfrontend architecture.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link to="/browse">Browse Content</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/create">Start Creating</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Features</h2>
          <p className="mt-2 text-muted-foreground">
            Everything you need to manage your knowledge base
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-lg border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
            >
              <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-lg border bg-muted/50 p-8 text-center md:p-12">
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="text-muted-foreground">
            Join thousands of users who are already organizing their knowledge
            with our platform.
          </p>
          <Button size="lg" asChild>
            <Link to="/create">Create Your First Article</Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid gap-8 md:grid-cols-3">
        <div className="space-y-2 text-center">
          <p className="text-4xl font-bold text-primary">1000+</p>
          <p className="text-sm text-muted-foreground">Articles Published</p>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-4xl font-bold text-primary">500+</p>
          <p className="text-sm text-muted-foreground">Active Users</p>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-4xl font-bold text-primary">10k+</p>
          <p className="text-sm text-muted-foreground">Daily Reads</p>
        </div>
      </section>
    </div>
  );
};
