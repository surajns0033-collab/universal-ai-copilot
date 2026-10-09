'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { CheckIcon, CopyIcon } from '@/components/ui/Icons';

export interface CopyButtonProps {
    text: string;
    label?: string;
}

/** Copy arbitrary text to the clipboard with transient confirmation. */
export function CopyButton({ text, label = 'Copy' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            // Clipboard access can be denied; fail silently rather than crash the UI.
            setCopied(false);
        }
    };

    return (
        <Button variant="ghost" size="sm" onClick={handleCopy} aria-live="polite">
            {copied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <CopyIcon className="h-4 w-4" />}
            {copied ? 'Copied' : label}
        </Button>
    );
}
