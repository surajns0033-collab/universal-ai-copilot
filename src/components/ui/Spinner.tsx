import { cn } from '@/lib/utilities/cn';

export interface SpinnerProps {
    className?: string;
    label?: string;
}

/** Accessible inline spinner. */
export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
    return (
        <span role="status" aria-label={label} className="inline-flex items-center">
            <svg
                className={cn('h-4 w-4 animate-spin text-current', className)}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
            </svg>
        </span>
    );
}

/** Skeleton block used for loading placeholders. */
export function Skeleton({ className }: { className?: string }) {
    return <div className={cn('skeleton h-4 w-full', className)} aria-hidden="true" />;
}
