'use client';

import { Button } from '@/components/ui/Button';
import { HelpIcon } from '@/components/ui/Icons';

export interface QuestionInputProps {
    value: string;
    onChange: (value: string) => void;
    onAsk: () => void;
    disabled: boolean;
}

/** Free-text question entry for the Ask AI action. */
export function QuestionInput({ value, onChange, onAsk, disabled }: QuestionInputProps) {
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onAsk();
            }}
            className="space-y-2"
        >
            <label htmlFor="copilot-question" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Ask a question about this content
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
                <input
                    id="copilot-question"
                    type="text"
                    value={value}
                    disabled={disabled}
                    maxLength={2000}
                    placeholder="e.g. What are the three main risks described?"
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-50 disabled:text-slate-400"
                />
                <Button type="submit" disabled={disabled || value.trim().length === 0} size="md">
                    <HelpIcon className="h-4 w-4" />
                    Ask
                </Button>
            </div>
        </form>
    );
}
