import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    status: {
      control: 'select',
      options: ['online', 'offline', 'away', 'busy'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/124599?v=4',
    alt: 'User avatar',
  },
};

export const WithFallback: Story = {
  args: {
    fallback: 'JD',
  },
};

export const WithStatus: Story = {
  args: {
    src: 'https://avatars.githubusercontent.com/u/124599?v=4',
    alt: 'User avatar',
    status: 'online',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      <Avatar size="xs" fallback="XS" />
      <Avatar size="sm" fallback="SM" />
      <Avatar size="md" fallback="MD" />
      <Avatar size="lg" fallback="LG" />
      <Avatar size="xl" fallback="XL" />
      <Avatar size="2xl" fallback="2X" />
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar fallback="ON" status="online" />
      <Avatar fallback="OF" status="offline" />
      <Avatar fallback="AW" status="away" />
      <Avatar fallback="BS" status="busy" />
    </div>
  ),
};

export const WithImages: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar
        src="https://avatars.githubusercontent.com/u/124599?v=4"
        alt="User 1"
        status="online"
      />
      <Avatar
        src="https://avatars.githubusercontent.com/u/124600?v=4"
        alt="User 2"
        status="away"
      />
      <Avatar
        src="https://avatars.githubusercontent.com/u/124601?v=4"
        alt="User 3"
        status="busy"
      />
    </div>
  ),
};
