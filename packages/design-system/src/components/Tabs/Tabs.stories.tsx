/* eslint-disable react-hooks/rules-of-hooks, react/no-unescaped-entities */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';
import { Button } from '../Button/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../Card/Card';
import { Badge } from '../Badge/Badge';
import { Input } from '../Input/Input';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A set of layered sections of content (tab panels) that display one panel at a time. Built on Radix UI Tabs primitive with keyboard navigation support.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

/**
 * Basic tabs with three panels. Click or use arrow keys to navigate between tabs.
 */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList className="w-full">
        <TabsTrigger value="overview" className="flex-1">
          Overview
        </TabsTrigger>
        <TabsTrigger value="details" className="flex-1">
          Details
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex-1">
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <h3 className="text-lg font-semibold">Overview</h3>
        <p className="text-sm text-gray-600">
          This is the overview tab. It contains general information about the
          content.
        </p>
      </TabsContent>
      <TabsContent value="details" className="space-y-4">
        <h3 className="text-lg font-semibold">Details</h3>
        <p className="text-sm text-gray-600">
          This is the details tab. It contains more specific information.
        </p>
      </TabsContent>
      <TabsContent value="settings" className="space-y-4">
        <h3 className="text-lg font-semibold">Settings</h3>
        <p className="text-sm text-gray-600">
          This is the settings tab. Configure your preferences here.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Tabs with badge indicators showing counts or status.
 */
export const WithBadges: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-full max-w-lg">
      <TabsList className="w-full">
        <TabsTrigger value="all" className="flex-1 gap-2">
          All <Badge variant="secondary">23</Badge>
        </TabsTrigger>
        <TabsTrigger value="active" className="flex-1 gap-2">
          Active <Badge variant="success">5</Badge>
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex-1 gap-2">
          Pending <Badge variant="warning">8</Badge>
        </TabsTrigger>
        <TabsTrigger value="archived" className="flex-1 gap-2">
          Archived <Badge variant="default">10</Badge>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="space-y-2 pt-4">
        <p className="text-sm text-gray-600">Showing all 23 items</p>
      </TabsContent>
      <TabsContent value="active" className="space-y-2 pt-4">
        <p className="text-sm text-gray-600">Showing 5 active items</p>
      </TabsContent>
      <TabsContent value="pending" className="space-y-2 pt-4">
        <p className="text-sm text-gray-600">Showing 8 pending items</p>
      </TabsContent>
      <TabsContent value="archived" className="space-y-2 pt-4">
        <p className="text-sm text-gray-600">Showing 10 archived items</p>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Tabs with disabled state. The third tab is disabled and cannot be selected.
 */
export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="available" className="w-full max-w-md">
      <TabsList className="w-full">
        <TabsTrigger value="available" className="flex-1">
          Available
        </TabsTrigger>
        <TabsTrigger value="pending" className="flex-1">
          Pending
        </TabsTrigger>
        <TabsTrigger value="restricted" disabled className="flex-1">
          Restricted
        </TabsTrigger>
      </TabsList>
      <TabsContent value="available" className="space-y-4">
        <h3 className="text-lg font-semibold">Available</h3>
        <p className="text-sm text-gray-600">
          These features are available to all users.
        </p>
      </TabsContent>
      <TabsContent value="pending" className="space-y-4">
        <h3 className="text-lg font-semibold">Pending</h3>
        <p className="text-sm text-gray-600">These features are coming soon.</p>
      </TabsContent>
      <TabsContent value="restricted" className="space-y-4">
        <h3 className="text-lg font-semibold">Restricted</h3>
        <p className="text-sm text-gray-600">
          This content requires special permissions.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Tabs with controlled state using React hooks.
 */
export const Controlled: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('tab1');

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab('tab1')}
          >
            Go to Tab 1
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab('tab2')}
          >
            Go to Tab 2
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab('tab3')}
          >
            Go to Tab 3
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-md"
        >
          <TabsList className="w-full">
            <TabsTrigger value="tab1" className="flex-1">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" className="flex-1">
              Tab 2
            </TabsTrigger>
            <TabsTrigger value="tab3" className="flex-1">
              Tab 3
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <p className="text-sm text-gray-600">
              Tab 1 content. Current active tab: <strong>{activeTab}</strong>
            </p>
          </TabsContent>
          <TabsContent value="tab2">
            <p className="text-sm text-gray-600">
              Tab 2 content. Current active tab: <strong>{activeTab}</strong>
            </p>
          </TabsContent>
          <TabsContent value="tab3">
            <p className="text-sm text-gray-600">
              Tab 3 content. Current active tab: <strong>{activeTab}</strong>
            </p>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};

/**
 * Tabs containing Card components for structured content.
 */
export const WithCards: Story = {
  render: () => (
    <Tabs defaultValue="dashboard" className="w-full max-w-2xl">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="dashboard" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Active users this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-sm text-green-600">↑ 12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Total revenue this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$45,678</p>
              <p className="text-sm text-green-600">↑ 8% from last month</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Analytics Overview</CardTitle>
            <CardDescription>Key metrics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Analytics data would be displayed here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="reports" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>Generate and view reports</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Generate Report</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Settings panel with tabs for different configuration sections.
 */
export const SettingsPanel: Story = {
  render: () => (
    <Tabs defaultValue="general" className="w-full max-w-2xl">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage your general preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Display Name</label>
              <Input
                placeholder="Enter your display name"
                defaultValue="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Input placeholder="Select language" defaultValue="English" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="account" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                defaultValue="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <Input placeholder="username" defaultValue="johndoe" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Update Account</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose what notifications you receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">
                  Receive updates via email
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-600">
                  Receive browser notifications
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Manage your security preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Change Password</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Tabs with long content that scrolls within the tab panel.
 */
export const WithScrollableContent: Story = {
  render: () => (
    <Tabs defaultValue="content" className="w-full max-w-2xl">
      <TabsList>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="metadata">Metadata</TabsTrigger>
      </TabsList>
      <TabsContent
        value="content"
        className="max-h-96 overflow-y-auto space-y-4"
      >
        <h3 className="text-lg font-semibold">Long Scrollable Content</h3>
        {Array.from({ length: 20 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Section {i + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                This is section {i + 1} of the scrollable content. The content
                area has a maximum height and will scroll when it overflows.
              </p>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
      <TabsContent value="metadata">
        <p className="text-sm text-gray-600">
          Metadata information would be displayed here.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Minimal tabs with just text content.
 */
export const Minimal: Story = {
  render: () => (
    <Tabs defaultValue="description" className="w-full max-w-md">
      <TabsList>
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specs">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsContent value="description" className="py-4">
        <p className="text-sm text-gray-600">
          This is the product description. It provides detailed information
          about the product features and benefits.
        </p>
      </TabsContent>
      <TabsContent value="specs" className="py-4">
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Dimension: 10" x 8" x 2"</li>
          <li>• Weight: 2.5 lbs</li>
          <li>• Material: Premium fabric</li>
          <li>• Color: Multiple options available</li>
        </ul>
      </TabsContent>
      <TabsContent value="reviews" className="py-4">
        <p className="text-sm text-gray-600">
          Customer reviews would be displayed here.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

/**
 * Tabs with many options that require horizontal scrolling on mobile.
 */
export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-full max-w-2xl">
      <TabsList className="overflow-x-auto">
        {Array.from({ length: 10 }).map((_, i) => (
          <TabsTrigger key={i} value={`tab${i + 1}`}>
            Tab {i + 1}
          </TabsTrigger>
        ))}
      </TabsList>
      {Array.from({ length: 10 }).map((_, i) => (
        <TabsContent key={i} value={`tab${i + 1}`}>
          <p className="text-sm text-gray-600">Content for Tab {i + 1}</p>
        </TabsContent>
      ))}
    </Tabs>
  ),
};
