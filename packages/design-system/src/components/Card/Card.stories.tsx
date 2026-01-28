/* eslint-disable react/no-unescaped-entities */
import type { Meta, StoryObj } from '@storybook/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './Card';
import { Button } from '../Button';
import { Badge } from '../Badge';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Card padding size',
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Card shadow depth',
    },
    hoverable: {
      control: 'boolean',
      description: 'Adds hover effect',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content of the card.</p>
      </CardContent>
      <CardFooter>
        <Button variant="primary">Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithoutHeader: Story = {
  render: (args) => (
    <Card {...args}>
      <CardContent>
        <p>A simple card with just content, no header or footer.</p>
      </CardContent>
    </Card>
  ),
};

export const Hoverable: Story = {
  args: {
    hoverable: true,
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Hoverable Card</CardTitle>
        <CardDescription>Hover over me to see the effect</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card has a hover effect with increased shadow.</p>
      </CardContent>
    </Card>
  ),
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Compact Card</CardTitle>
        <CardDescription>Small padding for dense layouts</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with minimal spacing.</p>
      </CardContent>
    </Card>
  ),
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Spacious Card</CardTitle>
        <CardDescription>Large padding for breathing room</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content with generous spacing.</p>
      </CardContent>
    </Card>
  ),
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
  },
  render: (args) => (
    <Card {...args}>
      <div className="p-0">
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
          alt="Product"
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <div className="p-6">
          <CardTitle>Product Card</CardTitle>
          <CardDescription className="mt-2">
            Card with image and custom padding
          </CardDescription>
          <div className="mt-4">
            <Badge variant="success">In Stock</Badge>
          </div>
        </div>
      </div>
    </Card>
  ),
};

export const LargeShadow: Story = {
  args: {
    shadow: 'lg',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Elevated Card</CardTitle>
        <CardDescription>Large shadow for emphasis</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card appears to float above the page.</p>
      </CardContent>
    </Card>
  ),
};

export const NoShadow: Story = {
  args: {
    shadow: 'none',
  },
  render: (args) => (
    <Card {...args}>
      <CardHeader>
        <CardTitle>Flat Card</CardTitle>
        <CardDescription>No shadow, just border</CardDescription>
      </CardHeader>
      <CardContent>
        <p>A subtle card design without elevation.</p>
      </CardContent>
    </Card>
  ),
};

export const ArticlePreview: Story = {
  args: {
    hoverable: true,
  },
  render: (args) => (
    <Card {...args} className="max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2 mb-3">
          <Badge>Technology</Badge>
          <span className="text-sm text-muted-foreground">5 min read</span>
        </div>
        <CardTitle>Building a Design System</CardTitle>
        <CardDescription>
          A comprehensive guide to creating reusable UI components
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">
          Learn how to build a scalable design system using React, TypeScript,
          and Tailwind CSS. We'll cover component architecture, theming, and
          best practices.
        </p>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">Jan 28, 2026</span>
        <Button variant="ghost" size="sm">
          Read More →
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const UserProfile: Story = {
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
          <div>
            <CardTitle>Sarah Johnson</CardTitle>
            <CardDescription>Frontend Developer</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Passionate about building accessible and performant web applications.
        </p>
        <div className="flex gap-2 mt-4">
          <Badge variant="default">React</Badge>
          <Badge variant="default">TypeScript</Badge>
          <Badge variant="default">Design Systems</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="primary" fullWidth>
          View Profile
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Stats: Story = {
  render: (args) => (
    <div className="grid grid-cols-3 gap-4">
      <Card {...args}>
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-3xl">1,234</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">↑ 12% from last month</p>
        </CardContent>
      </Card>
      <Card {...args}>
        <CardHeader>
          <CardDescription>Revenue</CardDescription>
          <CardTitle className="text-3xl">$45,231</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">↑ 8% from last month</p>
        </CardContent>
      </Card>
      <Card {...args}>
        <CardHeader>
          <CardDescription>Active Projects</CardDescription>
          <CardTitle className="text-3xl">23</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">↓ 3% from last month</p>
        </CardContent>
      </Card>
    </div>
  ),
};
