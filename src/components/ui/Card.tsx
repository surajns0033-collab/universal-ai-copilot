import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utilities/cn';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70', className)}
            {...rest}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4', className)} {...rest}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2 className={cn('text-sm font-semibold tracking-tight text-slate-900', className)} {...rest}>
            {children}
        </h2>
    );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('px-5 py-4', className)} {...rest}>
            {children}
        </div>
    );
}

export function SectionLabel({ children }: { children: ReactNode }) {
    return (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{children}</p>
    );
}
