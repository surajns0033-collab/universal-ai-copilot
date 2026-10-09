'use client';

import { ACTIONS } from '@/config/constants';
import { ACTION_ICONS } from '@/components/ui/Icons';
import { cn } from '@/lib/utilities/cn';
import type { AiAction } from '@/types/ai';

export interface ActionBarProps {
    onRun: (action: AiAction) => void;
    activeAction: AiAction | null;
    disabled: boolean;
}

/**
 * Grid of AI action buttons. Purely presentational: it emits the chosen action
 * id and reflects which one is currently running.
 */
export function ActionBar({ onRun, activeAction, disabled }: ActionBarProps) {
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ACTIONS.map((action) => {
                const Icon = ACTION_ICONS[action.icon];
                const isActive = activeAction === action.id;
                return (
                    <button
                        key={action.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onRun(action.id)}
                        title={action.description}
                        aria-pressed={isActive}
                        className={cn(
                            'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            isActive
                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                        )}
                    >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{action.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
