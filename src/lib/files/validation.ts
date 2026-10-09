/**
 * File validation and classification.
 *
 * Pure functions with no browser/Node coupling so they are trivially testable
 * and reusable on both the client (pre-flight feedback) and the server
 * (authoritative enforcement).
 */
import {
    ACCEPTED_EXTENSIONS,
    ACCEPTED_MIME_TYPES,
    MIN_FILE_BYTES,
} from '@/config/constants';
import type { SourceDescriptor } from '@/types/ai';
import { AppError } from '@/lib/errors';

/** Extract the lower-case extension (without dot) from a filename. */
export function getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot < 0 || lastDot === filename.length - 1) return '';
    return filename.slice(lastDot + 1).toLowerCase();
}

/** True when the extension is one we accept. */
export function isAcceptedExtension(filename: string): boolean {
    return (ACCEPTED_EXTENSIONS as readonly string[]).includes(getExtension(filename));
}

/** Determine whether a MIME type maps to an image or document. */
export function classifyMime(mimeType: string): 'image' | 'document' | null {
    return ACCEPTED_MIME_TYPES[mimeType.toLowerCase()] ?? null;
}

/** True when the MIME type is accepted. */
export function isAcceptedMime(mimeType: string): boolean {
    return classifyMime(mimeType) !== null;
}

export interface FileValidationInput {
    filename: string;
    mimeType: string;
    sizeBytes: number;
}

/**
 * Validate a candidate upload.
 *
 * Checks, in order of clarity: non-empty file, size limit, extension, and MIME
 * type. Throws an {@link AppError} with a precise code + safe message.
 *
 * @param maxBytes - Maximum allowed size in bytes.
 */
export function validateFile(input: FileValidationInput, maxBytes: number): void {
    const { filename, mimeType, sizeBytes } = input;

    if (!filename || filename.trim().length === 0) {
        throw new AppError('VALIDATION_ERROR', 'A filename is required.');
    }

    if (!Number.isFinite(sizeBytes) || sizeBytes < MIN_FILE_BYTES) {
        throw new AppError('EMPTY_FILE', 'The file appears to be empty.');
    }

    if (sizeBytes > maxBytes) {
        const limitMb = Math.floor(maxBytes / (1024 * 1024));
        throw new AppError(
            'FILE_TOO_LARGE',
            `File is larger than the ${limitMb} MB limit.`,
        );
    }

    if (!isAcceptedExtension(filename)) {
        throw new AppError(
            'UNSUPPORTED_FILE_TYPE',
            `Unsupported file extension. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}.`,
        );
    }

    if (!isAcceptedMime(mimeType)) {
        throw new AppError(
            'UNSUPPORTED_FILE_TYPE',
            `Unsupported file type "${mimeType}". Accepted: PDF, PNG, JPG/JPEG, TXT.`,
        );
    }
}

/**
 * Build a {@link SourceDescriptor} from validated input.
 * Assumes {@link validateFile} has already passed.
 */
export function describeSource(input: FileValidationInput): SourceDescriptor {
    const kind = classifyMime(input.mimeType);
    if (!kind) {
        throw new AppError('UNSUPPORTED_FILE_TYPE', 'Unsupported file type.');
    }
    return {
        filename: sanitizeFilename(input.filename),
        mimeType: input.mimeType.toLowerCase(),
        sizeBytes: input.sizeBytes,
        kind,
    };
}

/**
 * Sanitise a filename for safe display/logging: strip path separators and
 * control characters, and cap the length.
 */
export function sanitizeFilename(filename: string): string {
    const base = filename.split(/[\\/]/).pop() ?? filename;
    // eslint-disable-next-line no-control-regex
    const cleaned = base.replace(/[\u0000-\u001f<>:"|?*]/g, '').trim();
    return cleaned.slice(0, 200) || 'untitled';
}

/** Convert bytes to a compact human-readable string. */
export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
