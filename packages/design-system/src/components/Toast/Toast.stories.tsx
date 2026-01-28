/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/rules-of-hooks, react/no-unescaped-entities */
import type { Meta, StoryObj } from '@storybook/react';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
} from './Toast';
import { Button } from '../Button';
import { useState } from 'react';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toast>;

const ToastDemo = ({ variant = 'default', title, description }: any) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Show Toast</Button>
      <Toast open={open} onOpenChange={setOpen} variant={variant}>
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
        </div>
        <ToastClose />
      </Toast>
    </>
  );
};

export const Default: Story = {
  render: () => (
    <ToastDemo
      title="Notification"
      description="This is a default toast notification."
    />
  ),
};

export const Success: Story = {
  render: () => (
    <ToastDemo
      variant="success"
      title="Success!"
      description="Your changes have been saved successfully."
    />
  ),
};

export const Error: Story = {
  render: () => (
    <ToastDemo
      variant="error"
      title="Error"
      description="Something went wrong. Please try again."
    />
  ),
};

export const Warning: Story = {
  render: () => (
    <ToastDemo
      variant="warning"
      title="Warning"
      description="Your session will expire in 5 minutes."
    />
  ),
};

export const Info: Story = {
  render: () => (
    <ToastDemo
      variant="info"
      title="Info"
      description="A new version of the app is available."
    />
  ),
};

export const WithAction: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Show Toast with Action</Button>
        <Toast open={open} onOpenChange={setOpen}>
          <div>
            <ToastTitle>Update Available</ToastTitle>
            <ToastDescription>
              A new version is ready to install.
            </ToastDescription>
          </div>
          <ToastAction altText="Update now" onClick={() => setOpen(false)}>
            Update
          </ToastAction>
          <ToastClose />
        </Toast>
      </>
    );
  },
};

export const TitleOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Show Simple Toast</Button>
        <Toast open={open} onOpenChange={setOpen}>
          <ToastTitle>File uploaded successfully</ToastTitle>
          <ToastClose />
        </Toast>
      </>
    );
  },
};

export const DescriptionOnly: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Show Description Toast</Button>
        <Toast open={open} onOpenChange={setOpen}>
          <ToastDescription>
            Your settings have been automatically saved.
          </ToastDescription>
          <ToastClose />
        </Toast>
      </>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>Show Long Toast</Button>
        <Toast open={open} onOpenChange={setOpen} variant="info">
          <div>
            <ToastTitle>System Maintenance Scheduled</ToastTitle>
            <ToastDescription>
              Our platform will undergo scheduled maintenance on January 30th
              from 2:00 AM to 4:00 AM UTC. During this time, some features may
              be unavailable.
            </ToastDescription>
          </div>
          <ToastAction altText="Learn more" onClick={() => setOpen(false)}>
            Learn More
          </ToastAction>
          <ToastClose />
        </Toast>
      </>
    );
  },
};

export const MultipleToasts: Story = {
  render: () => {
    const [toasts, setToasts] = useState<Array<{ id: number; open: boolean }>>(
      []
    );
    let nextId = 0;

    const showToast = () => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, open: true }]);

      // Auto-close after 3 seconds
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, open: false } : t))
        );
      }, 3000);
    };

    return (
      <>
        <Button onClick={showToast}>Show Multiple Toasts</Button>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            open={toast.open}
            onOpenChange={(open) => {
              if (!open) {
                setToasts((prev) =>
                  prev.map((t) => (t.id === toast.id ? { ...t, open } : t))
                );
              }
            }}
          >
            <div>
              <ToastTitle>Toast #{toast.id + 1}</ToastTitle>
              <ToastDescription>
                This is toast number {toast.id + 1}
              </ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        ))}
      </>
    );
  },
};

export const AutoDismiss: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const showToast = () => {
      setOpen(true);
      setTimeout(() => setOpen(false), 3000);
    };

    return (
      <>
        <Button onClick={showToast}>Show Auto-Dismiss Toast</Button>
        <Toast open={open} onOpenChange={setOpen} variant="success">
          <div>
            <ToastTitle>Auto Dismiss</ToastTitle>
            <ToastDescription>
              This toast will automatically close after 3 seconds.
            </ToastDescription>
          </div>
          <ToastClose />
        </Toast>
      </>
    );
  },
};

export const AllVariants: Story = {
  render: () => {
    const [openStates, setOpenStates] = useState({
      default: false,
      success: false,
      error: false,
      warning: false,
      info: false,
    });

    const showToast = (variant: keyof typeof openStates) => {
      setOpenStates((prev) => ({ ...prev, [variant]: true }));
    };

    return (
      <div className="flex gap-2">
        <Button onClick={() => showToast('default')}>Default</Button>
        <Button variant="success" onClick={() => showToast('success')}>
          Success
        </Button>
        <Button variant="destructive" onClick={() => showToast('error')}>
          Error
        </Button>
        <Button variant="warning" onClick={() => showToast('warning')}>
          Warning
        </Button>
        <Button variant="secondary" onClick={() => showToast('info')}>
          Info
        </Button>

        <Toast
          open={openStates.default}
          onOpenChange={(open) =>
            setOpenStates((prev) => ({ ...prev, default: open }))
          }
        >
          <ToastTitle>Default Toast</ToastTitle>
          <ToastDescription>This is a default toast message.</ToastDescription>
          <ToastClose />
        </Toast>

        <Toast
          open={openStates.success}
          onOpenChange={(open) =>
            setOpenStates((prev) => ({ ...prev, success: open }))
          }
          variant="success"
        >
          <ToastTitle>Success Toast</ToastTitle>
          <ToastDescription>Operation completed successfully.</ToastDescription>
          <ToastClose />
        </Toast>

        <Toast
          open={openStates.error}
          onOpenChange={(open) =>
            setOpenStates((prev) => ({ ...prev, error: open }))
          }
          variant="error"
        >
          <ToastTitle>Error Toast</ToastTitle>
          <ToastDescription>An error occurred.</ToastDescription>
          <ToastClose />
        </Toast>

        <Toast
          open={openStates.warning}
          onOpenChange={(open) =>
            setOpenStates((prev) => ({ ...prev, warning: open }))
          }
          variant="warning"
        >
          <ToastTitle>Warning Toast</ToastTitle>
          <ToastDescription>Please review your action.</ToastDescription>
          <ToastClose />
        </Toast>

        <Toast
          open={openStates.info}
          onOpenChange={(open) =>
            setOpenStates((prev) => ({ ...prev, info: open }))
          }
          variant="info"
        >
          <ToastTitle>Info Toast</ToastTitle>
          <ToastDescription>Here's some information.</ToastDescription>
          <ToastClose />
        </Toast>
      </div>
    );
  },
};
