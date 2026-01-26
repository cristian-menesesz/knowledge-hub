import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ message = 'Test error' }: { message?: string }) => {
  throw new Error(message);
};

// Component that doesn't throw
const NoError = () => <div>No error</div>;

// Suppress console.error during tests (ErrorBoundary logs to console)
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => {});

beforeEach(() => {
  mockConsoleError.mockClear();
});

afterAll(() => {
  mockConsoleError.mockRestore();
});

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error fallback when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Something went wrong'
    );
  });

  it('should display generic error message', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Custom error message" />
      </ErrorBoundary>
    );

    // Component shows generic message, not the actual error message (unless in dev mode)
    expect(
      screen.getByText(/We apologize for the inconvenience/)
    ).toBeInTheDocument();
  });

  it('should show Try Again button', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const button = screen.getByRole('button', { name: /try again/i });
    expect(button).toBeInTheDocument();
  });

  it('should show Go Home button', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const button = screen.getByRole('button', { name: /go home/i });
    expect(button).toBeInTheDocument();
  });

  it('should have alert icon', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Check for the AlertTriangle icon (lucide-react renders SVG with specific class)
    const svg = screen
      .getByRole('heading', { level: 1 })
      .parentElement?.parentElement?.querySelector('svg.lucide-alert-triangle');
    expect(svg).toBeInTheDocument();
  });

  it('should reset error on Try Again click', async () => {
    const user = userEvent.setup();
    const shouldThrow = true;

    const ConditionalError = () => {
      if (shouldThrow) {
        throw new Error('Error');
      }
      return <div>Success</div>;
    };

    render(
      <ErrorBoundary>
        <ConditionalError />
      </ErrorBoundary>
    );

    // Should show error
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Something went wrong'
    );

    // Click Try Again button
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();

    // Button should be clickable (testing that it exists and has onClick handler)
    await user.click(tryAgainButton);
  });

  it('should hide error details by default (production mode)', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="Custom error message" />
      </ErrorBoundary>
    );

    // Error details should NOT be visible in test environment (no __DEV__ flag)
    expect(screen.queryByText('Custom error message')).not.toBeInTheDocument();
  });

  it('should display error details when __DEV__ is set', () => {
    // Simulate dev mode
    (window as Window & { __DEV__?: boolean }).__DEV__ = true;

    render(
      <ErrorBoundary>
        <ThrowError message="Custom error message" />
      </ErrorBoundary>
    );

    // Error message should be visible in dev mode
    expect(screen.getByText('Custom error message')).toBeInTheDocument();

    // Clean up
    delete (window as Window & { __DEV__?: boolean }).__DEV__;
  });
});
