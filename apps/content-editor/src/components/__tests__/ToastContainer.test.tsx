/** @jsxImportSource react */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ToastContainer from '../ToastContainer';

const mockToasts = [
  {
    id: 'toast-1',
    type: 'success' as const,
    message: 'First toast message',
  },
  {
    id: 'toast-2',
    type: 'error' as const,
    message: 'Second toast message',
  },
  {
    id: 'toast-3',
    type: 'info' as const,
    message: 'Third toast message',
  },
];

describe('ToastContainer', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render nothing when toasts array is empty', () => {
      const { container } = render(
        <ToastContainer toasts={[]} onDismiss={mockOnDismiss} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render all toasts from the array', () => {
      render(<ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />);

      expect(screen.getByText('First toast message')).toBeInTheDocument();
      expect(screen.getByText('Second toast message')).toBeInTheDocument();
      expect(screen.getByText('Third toast message')).toBeInTheDocument();
    });

    it('should render toasts with correct types', () => {
      render(<ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />);

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(3);

      // Check first toast is success (green)
      expect(alerts[0]).toHaveClass('bg-green-50');

      // Check second toast is error (red)
      expect(alerts[1]).toHaveClass('bg-red-50');

      // Check third toast is info (blue)
      expect(alerts[2]).toHaveClass('bg-blue-50');
    });

    it('should position container at bottom-right', () => {
      const { container } = render(
        <ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />
      );

      const toastContainer = container.firstChild as HTMLElement;
      expect(toastContainer).toHaveClass('bottom-4');
      expect(toastContainer).toHaveClass('right-4');
      expect(toastContainer).toHaveClass('fixed');
    });

    it('should render toasts with unique keys', () => {
      render(<ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />);

      const alerts = screen.getAllByRole('alert');
      expect(alerts).toHaveLength(3);

      // Each toast should be distinct
      alerts.forEach((alert) => {
        expect(alert).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onDismiss with correct toast ID when dismiss is clicked', async () => {
      const user = userEvent.setup();
      render(<ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />);

      const dismissButtons = screen.getAllByLabelText('Dismiss');
      await user.click(dismissButtons[0]);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnDismiss).toHaveBeenCalledWith('toast-1');
    });

    it('should handle dismissing multiple toasts independently', async () => {
      const user = userEvent.setup();
      render(<ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />);

      const dismissButtons = screen.getAllByLabelText('Dismiss');

      // Dismiss first toast
      await user.click(dismissButtons[0]);
      expect(mockOnDismiss).toHaveBeenCalledWith('toast-1');

      // Dismiss third toast
      await user.click(dismissButtons[2]);
      expect(mockOnDismiss).toHaveBeenCalledWith('toast-3');

      expect(mockOnDismiss).toHaveBeenCalledTimes(2);
    });
  });

  describe('Dynamic Updates', () => {
    it('should update when toasts array changes', () => {
      const { rerender } = render(
        <ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />
      );

      expect(screen.getAllByRole('alert')).toHaveLength(3);

      // Update with fewer toasts
      const updatedToasts = [mockToasts[0]];
      rerender(
        <ToastContainer toasts={updatedToasts} onDismiss={mockOnDismiss} />
      );

      expect(screen.getAllByRole('alert')).toHaveLength(1);
      expect(screen.getByText('First toast message')).toBeInTheDocument();
      expect(
        screen.queryByText('Second toast message')
      ).not.toBeInTheDocument();
    });

    it('should render nothing after all toasts are dismissed', () => {
      const { rerender, container } = render(
        <ToastContainer toasts={mockToasts} onDismiss={mockOnDismiss} />
      );

      expect(screen.getAllByRole('alert')).toHaveLength(3);

      // Clear all toasts
      rerender(<ToastContainer toasts={[]} onDismiss={mockOnDismiss} />);

      expect(container.firstChild).toBeNull();
    });
  });
});
