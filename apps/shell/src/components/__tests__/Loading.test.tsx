import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../Loading';

describe('LoadingSpinner', () => {
  it('should render loading spinner by default', () => {
    render(<LoadingSpinner />);

    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute('aria-label', 'Loading');
  });

  it('should render with small size', () => {
    render(<LoadingSpinner size="sm" />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveClass('h-4', 'w-4');
  });

  it('should render with medium size (default)', () => {
    render(<LoadingSpinner />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveClass('h-8', 'w-8');
  });

  it('should render with large size', () => {
    render(<LoadingSpinner size="lg" />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveClass('h-12', 'w-12');
  });

  it('should have loading animation', () => {
    render(<LoadingSpinner />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveClass('animate-spin');
  });

  it('should have rounded-full border style', () => {
    render(<LoadingSpinner />);

    const loader = screen.getByRole('status');
    expect(loader).toHaveClass(
      'rounded-full',
      'border-primary',
      'border-t-transparent'
    );
  });
});
