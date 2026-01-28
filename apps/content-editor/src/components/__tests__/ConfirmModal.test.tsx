/** @jsxImportSource react */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConfirmModal from '../ConfirmModal';

describe('ConfirmModal', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    isOpen: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  describe('Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<ConfirmModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
      expect(
        screen.getByText('Are you sure you want to proceed?')
      ).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<ConfirmModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render with custom button text', () => {
      render(
        <ConfirmModal
          {...defaultProps}
          confirmText="Delete"
          cancelText="Go Back"
        />
      );

      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Go Back')).toBeInTheDocument();
    });

    it('should render with danger variant', () => {
      render(<ConfirmModal {...defaultProps} confirmVariant="danger" />);

      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('bg-red-600');
    });

    it('should render with primary variant by default', () => {
      render(<ConfirmModal {...defaultProps} />);

      const confirmButton = screen.getByText('Confirm');
      expect(confirmButton).toHaveClass('bg-blue-600');
    });

    it('should show alert icon for danger variant', () => {
      render(<ConfirmModal {...defaultProps} confirmVariant="danger" />);

      // Alert triangle icon is present (lucide-react renders as svg)
      const header = screen.getByText('Confirm Action').closest('div');
      expect(header?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      await user.click(screen.getByText('Confirm'));

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      await user.click(screen.getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when close button (X) is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close modal');
      await user.click(closeButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should call onCancel when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel when Escape is pressed if modal is closed', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} isOpen={false} />);

      await user.keyboard('{Escape}');

      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ConfirmModal {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('should have accessible close button', () => {
      render(<ConfirmModal {...defaultProps} />);

      const closeButton = screen.getByLabelText('Close modal');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Body Overflow Management', () => {
    it('should set body overflow to hidden when modal opens', () => {
      render(<ConfirmModal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body overflow when modal closes', () => {
      const { rerender } = render(<ConfirmModal {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<ConfirmModal {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Click Outside', () => {
    it('should call onCancel when clicking on backdrop', async () => {
      const user = userEvent.setup();
      render(<ConfirmModal {...defaultProps} />);

      const backdrop = screen.getByRole('dialog');
      await user.click(backdrop);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });
});
