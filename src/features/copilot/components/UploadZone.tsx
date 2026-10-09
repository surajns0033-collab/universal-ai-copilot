'use client';

import { useCallback, useRef, useState, type DragEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { UploadIcon } from '@/components/ui/Icons';
import { FILE_INPUT_ACCEPT } from '@/config/constants';
import { cn } from '@/lib/utilities/cn';

export interface UploadZoneProps {
    onSelect: (file: File) => void;
    disabled?: boolean;
}

/**
 * Drag-and-drop + click upload surface.
 *
 * Presentation only: it forwards the chosen File to the parent; all validation
 * happens in the feature hook so there is a single source of truth.
 */
export function UploadZone({ onSelect, disabled = false }: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = useCallback(
        (files: FileList | null) => {
            const file = files?.[0];
            if (file) onSelect(file);
        },
        [onSelect],
    );

    const onDrop = useCallback(
        (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDragging(false);
            if (disabled) return;
            handleFiles(event.dataTransfer.files);
        },
        [disabled, handleFiles],
    );

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                if (!disabled) setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={cn(
                'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors',
                isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-slate-50/60',
                disabled && 'opacity-60',
            )}
        >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-600 ring-1 ring-slate-200">
                <UploadIcon className="h-6 w-6" />
            </span>
            <p className="text-sm font-medium text-slate-800">
                Drag & drop a file, or choose one
            </p>
            <p className="mt-1 text-xs text-slate-500">PDF, PNG, JPG/JPEG, or TXT · up to 15 MB</p>

            <input
                ref={inputRef}
                type="file"
                accept={FILE_INPUT_ACCEPT}
                className="sr-only"
                disabled={disabled}
                onChange={(e) => {
                    handleFiles(e.target.files);
                    // Reset so selecting the same file again re-triggers onChange.
                    e.target.value = '';
                }}
            />

            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-5"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
            >
                Choose file
            </Button>
        </div>
    );
}
