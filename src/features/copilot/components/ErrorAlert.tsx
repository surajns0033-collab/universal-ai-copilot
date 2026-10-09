'use client';

import { Button } from '@/components/ui/Button';
import { AlertIcon, RefreshIcon } from '@/components/ui/Icons';
import type { CopilotError } from '../types';

export interface ErrorAlertProps {
    error: CopilotError;
    onRetry?: () => void;
    onDismiss?: () => void;
}

/** Inline, dismissible error surface. Messages are already user-safe. */
export function ErrorAlert({ error, onRetry, onDismiss }: ErrorAlertProps) {
    return (
        <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
        >
            <AlertIcon className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-red-800">{error.message}</p>
                <p className="mt-0.5 font-mono text-xs text-red-600">{error.code}</p>
                {error.details && (
                    <ul className="mt-2 list-inside list-disc text-xs text-red-700">
                        {Object.entries(error.details).map(([field, message]) => (
                            <li key={field}>
                                <span className="font-medium">{field}</span>: {message}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="mt-3 flex gap-2">
                    {onRetry && (
                        <Button variant="secondary" size="sm" onClick={onRetry}>
                            <RefreshIcon className="h-4 w-4" />
                            Retry
                        </Button>
                    )}
                    {onDismiss && (
                        <Button variant="ghost" size="sm" onClick={onDismiss}>
                            Dismiss
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
