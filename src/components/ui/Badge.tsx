import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utilities/cn';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

const toneClasses: Record<Tone, string> = {
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200',
    brand: 'bg-brand-50 text-brand-700 ring-brand-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-red-50 text-red-700 ring-red-200',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    tone?: Tone;
}

export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                toneClasses[tone],
                className,
            )}
            {...rest}
        >
            {children}
        </span>
    );
}
