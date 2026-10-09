import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utilities/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    /** Shows a spinner and disables the button. */
    loading?: boolean;
    fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
    primary:
        'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300',
    secondary:
        'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 active:bg-slate-100 disabled:text-slate-400',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 disabled:text-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-300',
};

const sizeClasses: Record<Size, string> = {
    sm: 'h-8 px-3 text-sm gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-12 px-6 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { variant = 'primary', size = 'md', loading = false, fullWidth = false, className, children, disabled, ...rest },
    ref,
) {
    return (
        <button
            ref={ref}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            className={cn(
                'inline-flex select-none items-center justify-center rounded-lg font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed',
                variantClasses[variant],
                sizeClasses[size],
                fullWidth && 'w-full',
                className,
            )}
            {...rest}
        >
            {loading && <Spinner />}
            {children}
        </button>
    );
});

function Spinner() {
    return (
        <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
            />
        </svg>
    );
}
