'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CloseIcon, FileIcon, ImageIcon } from '@/components/ui/Icons';
import { formatBytes } from '@/lib/files/validation';
import type { SelectedFile } from '../types';

export interface FilePreviewProps {
    selected: SelectedFile;
    onRemove: () => void;
    disabled?: boolean;
}

/** Preview card confirming exactly which content will be analysed. */
export function FilePreview({ selected, onRemove, disabled = false }: FilePreviewProps) {
    const { source, previewUrl } = selected;
    const isImage = source.kind === 'image';

    return (
        <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-500">
                {isImage && previewUrl ? (
                    <Image
                        src={previewUrl}
                        alt={`Preview of ${source.filename}`}
                        fill
                        unoptimized
                        className="object-cover"
                    />
                ) : isImage ? (
                    <ImageIcon className="h-6 w-6" />
                ) : (
                    <FileIcon className="h-6 w-6" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900" title={source.filename}>
                    {source.filename}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">{source.mimeType}</Badge>
                    <Badge tone="neutral">{formatBytes(source.sizeBytes)}</Badge>
                    <Badge tone={isImage ? 'brand' : 'neutral'}>
                        {isImage ? 'Image' : 'Document'}
                    </Badge>
                </div>
            </div>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label="Remove file"
                disabled={disabled}
                onClick={onRemove}
            >
                <CloseIcon className="h-4 w-4" />
            </Button>
        </div>
    );
}
