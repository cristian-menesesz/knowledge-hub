/** @jsxImportSource react */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Toast from '../Toast';

const mockToast = {
  id: 'test-toast-1',
  type: 'success' as const,
  message: 'Operation completed successfully',
};

describe('Toast', () => {
  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render toast with message', () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);

      expect(
        screen.getByText('Operation completed successfully')
      ).toBeInTheDocument();
    });

    it('should render success toast with correct styling', () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-green-50');
      expect(toast).toHaveClass('border-green-200');
      expect(toast).toHaveClass('text-green-800');
    });

    it('should render error toast with correct styling', () => {
      const errorToast = { ...mockToast, type: 'error' as const };
      render(<Toast toast={errorToast} onDismiss={mockOnDismiss} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-red-50');
      expect(toast).toHaveClass('border-red-200');
      expect(toast).toHaveClass('text-red-800');
    });

    it('should render info toast with correct styling', () => {
      const infoToast = { ...mockToast, type: 'info' as const };
      render(<Toast toast={infoToast} onDismiss={mockOnDismiss} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-blue-50');
      expect(toast).toHaveClass('border-blue-200');
      expect(toast).toHaveClass('text-blue-800');
    });

    it('should render warning toast with correct styling', () => {
      const warningToast = { ...mockToast, type: 'warning' as const };
      render(<Toast toast={warningToast} onDismiss={mockOnDismiss} />);

      const toast = screen.getByRole('alert');
      expect(toast).toHaveClass('bg-yellow-50');
      expect(toast).toHaveClass('border-yellow-200');
      expect(toast).toHaveClass('text-yellow-800');
    });

    it('should render icon for each toast type', () => {
      const types: Array<'success' | 'error' | 'info' | 'warning'> = [
        'success',
        'error',
        'info',
        'warning',
      ];

      types.forEach((type) => {
        const toast = { ...mockToast, type };
        const { container } = render(
          <Toast toast={toast} onDismiss={mockOnDismiss} />
        );

        // lucide-react icons render as SVG elements
        expect(container.querySelector('svg')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);

      const dismissButton = screen.getByLabelText('Dismiss');
      await user.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      expect(mockOnDismiss).toHaveBeenCalledWith('test-toast-1');
    });
  });

  describe('Accessibility', () => {
    it('should have alert role', () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have accessible dismiss button', () => {
      render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);

      const dismissButton = screen.getByLabelText('Dismiss');
      expect(dismissButton).toBeInTheDocument();
    });
  });
});
