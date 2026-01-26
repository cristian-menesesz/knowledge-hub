import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'],
    },
    disabled: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email',
  },
};

export const WithHelperText: Story = {
  args: {
    label: 'Username',
    placeholder: 'johndoe',
    helperText: 'Choose a unique username',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    placeholder: 'you@example.com',
    error: 'Please enter a valid email address',
    defaultValue: 'invalid-email',
  },
};

export const Required: Story = {
  args: {
    label: 'Password',
    type: 'password',
    required: true,
    helperText: 'Must be at least 8 characters',
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    leftIcon: <span>🔍</span>,
  },
};

export const WithRightIcon: Story = {
  args: {
    label: 'Password',
    type: 'password',
    rightIcon: <span>👁️</span>,
  },
};

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit',
    disabled: true,
    defaultValue: 'Disabled value',
  },
};

export const FullWidth: Story = {
  args: {
    label: 'Full Width Input',
    placeholder: 'Takes full width',
    fullWidth: true,
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Input label="Text" type="text" placeholder="Text input" />
      <Input label="Email" type="email" placeholder="Email input" />
      <Input label="Password" type="password" placeholder="Password input" />
      <Input label="Number" type="number" placeholder="Number input" />
      <Input label="Search" type="search" placeholder="Search input" />
      <Input label="URL" type="url" placeholder="URL input" />
      <Input label="Tel" type="tel" placeholder="Phone input" />
    </div>
  ),
};
