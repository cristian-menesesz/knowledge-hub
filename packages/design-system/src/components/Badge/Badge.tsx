import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        error: 'border-transparent bg-error text-error-foreground',
        info: 'border-transparent bg-info text-info-foreground',
        outline: 'border-border text-foreground',
        ghost: 'text-foreground hover:bg-accent',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before the badge content
   */
  icon?: React.ReactNode;
  /**
   * Whether the badge has a dot indicator
   */
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, dot, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current" />}
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';
