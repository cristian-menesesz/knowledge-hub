import { render, screen } from '@testing-library/react';
import { Loading } from '../Loading';

describe('Loading', () => {
  it('should render loading spinner by default', () => {
    render(<Loading />);

    const loader = screen.getByRole('status');
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute('aria-label', 'Loading');
  });

  it('should render with custom message', () => {
    render(<Loading message="Loading content..." />);

    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  it('should render with small size', () => {
    render(<Loading size="small" />);

    const loader = screen.getByRole('status');
    const svg = loader.querySelector('svg');
    expect(svg).toHaveClass('h-6', 'w-6');
  });

  it('should render with medium size (default)', () => {
    render(<Loading />);

    const loader = screen.getByRole('status');
    const svg = loader.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('should render with large size', () => {
    render(<Loading size="large" />);

    const loader = screen.getByRole('status');
    const svg = loader.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('should have loading animation', () => {
    render(<Loading />);

    const loader = screen.getByRole('status');
    const svg = loader.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('should be centered by default', () => {
    render(<Loading />);

    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });
});
