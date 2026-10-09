import { describe, expect, it } from 'vitest';
import {
    describeSource,
    formatBytes,
    getExtension,
    isAcceptedExtension,
    isAcceptedMime,
    sanitizeFilename,
    validateFile,
} from './validation';
import { AppError } from '@/lib/errors';

const MAX = 15 * 1024 * 1024;

describe('getExtension', () => {
    it('extracts a lower-case extension', () => {
        expect(getExtension('report.PDF')).toBe('pdf');
        expect(getExtension('scan.jpeg')).toBe('jpeg');
    });

    it('returns empty for a missing extension', () => {
        expect(getExtension('README')).toBe('');
        expect(getExtension('trailing.')).toBe('');
    });
});

describe('isAcceptedExtension', () => {
    it('accepts supported extensions', () => {
        for (const name of ['a.pdf', 'b.png', 'c.jpg', 'd.jpeg', 'e.txt']) {
            expect(isAcceptedExtension(name)).toBe(true);
        }
    });

    it('rejects unsupported extensions', () => {
        expect(isAcceptedExtension('a.exe')).toBe(false);
        expect(isAcceptedExtension('a.docx')).toBe(false);
    });
});

describe('isAcceptedMime / describeSource', () => {
    it('classifies images and documents', () => {
        expect(isAcceptedMime('image/png')).toBe(true);
        expect(describeSource({ filename: 'x.png', mimeType: 'image/png', sizeBytes: 10 }).kind).toBe('image');
        expect(describeSource({ filename: 'x.pdf', mimeType: 'application/pdf', sizeBytes: 10 }).kind).toBe('document');
    });

    it('rejects unknown MIME types', () => {
        expect(isAcceptedMime('application/zip')).toBe(false);
    });
});

describe('validateFile', () => {
    it('accepts a valid file', () => {
        expect(() =>
            validateFile({ filename: 'ok.pdf', mimeType: 'application/pdf', sizeBytes: 1024 }, MAX),
        ).not.toThrow();
    });

    it('rejects an empty file', () => {
        expect(() =>
            validateFile({ filename: 'ok.pdf', mimeType: 'application/pdf', sizeBytes: 0 }, MAX),
        ).toThrowError(AppError);
    });

    it('rejects an oversized file with FILE_TOO_LARGE', () => {
        try {
            validateFile({ filename: 'big.pdf', mimeType: 'application/pdf', sizeBytes: MAX + 1 }, MAX);
            throw new Error('should have thrown');
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);
            expect((err as AppError).code).toBe('FILE_TOO_LARGE');
        }
    });

    it('rejects an unsupported extension', () => {
        try {
            validateFile({ filename: 'bad.docx', mimeType: 'application/pdf', sizeBytes: 100 }, MAX);
            throw new Error('should have thrown');
        } catch (err) {
            expect((err as AppError).code).toBe('UNSUPPORTED_FILE_TYPE');
        }
    });

    it('rejects an unsupported MIME type', () => {
        try {
            validateFile({ filename: 'ok.pdf', mimeType: 'application/zip', sizeBytes: 100 }, MAX);
            throw new Error('should have thrown');
        } catch (err) {
            expect((err as AppError).code).toBe('UNSUPPORTED_FILE_TYPE');
        }
    });

    it('rejects a blank filename', () => {
        expect(() => validateFile({ filename: '  ', mimeType: 'text/plain', sizeBytes: 10 }, MAX)).toThrowError(AppError);
    });
});

describe('sanitizeFilename', () => {
    it('strips path separators and control characters', () => {
        expect(sanitizeFilename('C:\\evil\\..\\file.pdf')).toBe('file.pdf');
        expect(sanitizeFilename('bad\u0000name.txt')).toBe('badname.txt');
    });

    it('returns untitled for empty input', () => {
        expect(sanitizeFilename('')).toBe('untitled');
    });

    it('caps extremely long names', () => {
        const long = 'a'.repeat(500) + '.txt';
        expect(sanitizeFilename(long).length).toBeLessThanOrEqual(200);
    });
});

describe('formatBytes', () => {
    it('formats bytes, KB and MB', () => {
        expect(formatBytes(512)).toBe('512 B');
        expect(formatBytes(2048)).toBe('2.0 KB');
        expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
    });
});
