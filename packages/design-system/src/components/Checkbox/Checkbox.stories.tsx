/* eslint-disable react-hooks/rules-of-hooks, react/no-unescaped-entities */
import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { Checkbox } from './Checkbox';
import { Button } from '../Button/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../Card/Card';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'An accessible checkbox component built on Radix UI Checkbox primitive. Supports labels, descriptions, error states, and controlled/uncontrolled usage.',
      },
    },
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'The controlled checked state',
    },
    defaultChecked: {
      control: 'boolean',
      description: 'The default checked state for uncontrolled usage',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
    },
    label: {
      control: 'text',
      description: 'Label text displayed next to the checkbox',
    },
    description: {
      control: 'text',
      description: 'Description text shown below the label',
    },
    error: {
      control: 'text',
      description: 'Error message shown below the checkbox',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

/**
 * Basic checkbox without label.
 */
export const Default: Story = {
  args: {},
};

/**
 * Checkbox with label text.
 */
export const WithLabel: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

/**
 * Checkbox with label and description text.
 */
export const WithDescription: Story = {
  args: {
    label: 'Enable notifications',
    description: 'Receive email updates about new content and features',
  },
};

/**
 * Pre-checked checkbox (uncontrolled).
 */
export const DefaultChecked: Story = {
  args: {
    defaultChecked: true,
    label: 'Subscribe to newsletter',
  },
};

/**
 * Disabled checkbox that cannot be interacted with.
 */
export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <Checkbox disabled label="Disabled unchecked" />
      <Checkbox disabled checked label="Disabled checked" />
      <Checkbox
        disabled
        label="Disabled with description"
        description="This checkbox is disabled and cannot be changed"
      />
    </div>
  ),
};

/**
 * Checkbox in error state with error message.
 */
export const WithError: Story = {
  args: {
    label: 'I agree to the terms',
    error: 'You must accept the terms to continue',
  },
};

/**
 * Required checkbox with asterisk in label.
 */
export const Required: Story = {
  args: {
    required: true,
    label: 'I agree to the terms and conditions *',
    description: 'This field is required',
  },
};

/**
 * Controlled checkbox using React state.
 */
export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);

    return (
      <div className="space-y-4">
        <Checkbox
          checked={checked}
          onCheckedChange={setChecked}
          label="Controlled checkbox"
          description={`Current state: ${checked ? 'checked' : 'unchecked'}`}
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setChecked(true)}>
            Check
          </Button>
          <Button size="sm" variant="outline" onClick={() => setChecked(false)}>
            Uncheck
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setChecked((prev) => !prev)}
          >
            Toggle
          </Button>
        </div>
      </div>
    );
  },
};

/**
 * Indeterminate checkbox state (neither checked nor unchecked).
 * Useful for "select all" scenarios with partial selection.
 */
export const Indeterminate: Story = {
  render: () => {
    const [checked, setChecked] = React.useState<boolean | 'indeterminate'>(
      'indeterminate'
    );

    return (
      <div className="space-y-4">
        <Checkbox
          checked={checked}
          onCheckedChange={setChecked}
          label="Indeterminate checkbox"
          description={`Current state: ${
            checked === 'indeterminate'
              ? 'indeterminate'
              : checked
                ? 'checked'
                : 'unchecked'
          }`}
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setChecked(true)}>
            Check
          </Button>
          <Button size="sm" variant="outline" onClick={() => setChecked(false)}>
            Uncheck
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setChecked('indeterminate')}
          >
            Indeterminate
          </Button>
        </div>
      </div>
    );
  },
};

/**
 * Group of checkboxes for multiple selections.
 */
export const CheckboxGroup: Story = {
  render: () => {
    const [selections, setSelections] = React.useState({
      email: true,
      push: false,
      sms: false,
    });

    const handleChange = (key: keyof typeof selections) => {
      setSelections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Checkbox
            checked={selections.email}
            onCheckedChange={() => handleChange('email')}
            label="Email notifications"
            description="Receive updates via email"
          />
          <Checkbox
            checked={selections.push}
            onCheckedChange={() => handleChange('push')}
            label="Push notifications"
            description="Receive browser push notifications"
          />
          <Checkbox
            checked={selections.sms}
            onCheckedChange={() => handleChange('sms')}
            label="SMS notifications"
            description="Receive text message updates"
          />
        </CardContent>
        <CardFooter>
          <Button>Save Preferences</Button>
        </CardFooter>
      </Card>
    );
  },
};

/**
 * Select all checkbox with partial selection state.
 */
export const SelectAll: Story = {
  render: () => {
    const [items, setItems] = React.useState({
      item1: false,
      item2: false,
      item3: false,
      item4: false,
    });

    const allChecked = Object.values(items).every(Boolean);
    const someChecked = Object.values(items).some(Boolean);
    const selectAllState = allChecked
      ? true
      : someChecked
        ? 'indeterminate'
        : false;

    const handleSelectAll = () => {
      const newState = !allChecked;
      setItems({
        item1: newState,
        item2: newState,
        item3: newState,
        item4: newState,
      });
    };

    const handleItemChange = (key: keyof typeof items) => {
      setItems((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Select Items</CardTitle>
          <CardDescription>Choose which items to include</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Checkbox
            checked={selectAllState}
            onCheckedChange={handleSelectAll}
            label="Select all items"
            className="border-primary-600 font-semibold"
          />
          <div className="border-l-2 border-gray-200 pl-4 space-y-4">
            <Checkbox
              checked={items.item1}
              onCheckedChange={() => handleItemChange('item1')}
              label="Item 1"
              description="First item description"
            />
            <Checkbox
              checked={items.item2}
              onCheckedChange={() => handleItemChange('item2')}
              label="Item 2"
              description="Second item description"
            />
            <Checkbox
              checked={items.item3}
              onCheckedChange={() => handleItemChange('item3')}
              label="Item 3"
              description="Third item description"
            />
            <Checkbox
              checked={items.item4}
              onCheckedChange={() => handleItemChange('item4')}
              label="Item 4"
              description="Fourth item description"
            />
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-gray-600">
            Selected: {Object.values(items).filter(Boolean).length} of{' '}
            {Object.keys(items).length}
          </p>
        </CardFooter>
      </Card>
    );
  },
};

/**
 * Form with validation using checkboxes.
 */
export const FormExample: Story = {
  render: () => {
    const [agreed, setAgreed] = React.useState(false);
    const [newsletter, setNewsletter] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!agreed) {
        setError('You must accept the terms and conditions');
        return;
      }
      setError('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    };

    return (
      <Card className="max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Checkbox
              checked={agreed}
              onCheckedChange={(checked) => {
                setAgreed(checked === true);
                setError('');
              }}
              label="I agree to the terms and conditions *"
              description="Required to create an account"
              error={error}
              required
            />
            <Checkbox
              checked={newsletter}
              onCheckedChange={(checked) => setNewsletter(checked === true)}
              label="Subscribe to newsletter"
              description="Receive updates about new features (optional)"
            />
          </CardContent>
          <CardFooter className="flex-col items-start gap-2">
            <Button type="submit" fullWidth>
              Create Account
            </Button>
            {submitted && (
              <p className="text-sm text-green-600">
                ✓ Account created successfully!
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    );
  },
};

/**
 * Settings panel with various checkbox options.
 */
export const SettingsPanel: Story = {
  render: () => {
    const [settings, setSettings] = React.useState({
      darkMode: false,
      autoSave: true,
      notifications: true,
      analytics: false,
      betaFeatures: false,
    });

    const handleChange = (key: keyof typeof settings) => {
      setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Appearance</h3>
            <Checkbox
              checked={settings.darkMode}
              onCheckedChange={() => handleChange('darkMode')}
              label="Dark mode"
              description="Use dark color scheme"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Editor</h3>
            <Checkbox
              checked={settings.autoSave}
              onCheckedChange={() => handleChange('autoSave')}
              label="Auto-save"
              description="Automatically save changes every 30 seconds"
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Privacy</h3>
            <div className="space-y-4">
              <Checkbox
                checked={settings.notifications}
                onCheckedChange={() => handleChange('notifications')}
                label="Enable notifications"
                description="Allow the app to send you notifications"
              />
              <Checkbox
                checked={settings.analytics}
                onCheckedChange={() => handleChange('analytics')}
                label="Analytics"
                description="Help us improve by sharing anonymous usage data"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Advanced</h3>
            <Checkbox
              checked={settings.betaFeatures}
              onCheckedChange={() => handleChange('betaFeatures')}
              label="Beta features"
              description="Enable experimental features (may be unstable)"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset to Defaults</Button>
          <Button>Save Settings</Button>
        </CardFooter>
      </Card>
    );
  },
};

/**
 * Checkbox list for task selection.
 */
export const TaskList: Story = {
  render: () => {
    const [tasks, setTasks] = React.useState([
      { id: 1, label: 'Review pull requests', completed: true },
      { id: 2, label: 'Update documentation', completed: false },
      { id: 3, label: 'Fix bug #123', completed: false },
      { id: 4, label: 'Deploy to staging', completed: true },
      { id: 5, label: 'Write unit tests', completed: false },
    ]);

    const handleToggle = (id: number) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    };

    const completedCount = tasks.filter((task) => task.completed).length;

    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
          <CardDescription>
            {completedCount} of {tasks.length} completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggle(task.id)}
                label={task.label}
                className={task.completed ? 'line-through text-gray-500' : ''}
              />
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button variant="outline" fullWidth>
            Clear Completed
          </Button>
        </CardFooter>
      </Card>
    );
  },
};
