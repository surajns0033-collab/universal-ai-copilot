import { describe, expect, it } from 'vitest';
import { analyzeRequestSchema } from './request';

const base = {
    action: 'analyze',
    filename: 'report.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    dataBase64: 'JVBERi0=',
};

describe('analyzeRequestSchema', () => {
    it('accepts a valid analyze payload', () => {
        expect(analyzeRequestSchema.safeParse(base).success).toBe(true);
    });

    it('rejects an unknown action', () => {
        expect(analyzeRequestSchema.safeParse({ ...base, action: 'hack' }).success).toBe(false);
    });

    it('rejects an unsupported MIME type', () => {
        expect(
            analyzeRequestSchema.safeParse({ ...base, mimeType: 'application/zip' }).success,
        ).toBe(false);
    });

    it('rejects empty base64 data', () => {
        expect(analyzeRequestSchema.safeParse({ ...base, dataBase64: '' }).success).toBe(false);
    });

    it('rejects negative size', () => {
        expect(analyzeRequestSchema.safeParse({ ...base, sizeBytes: -1 }).success).toBe(false);
    });

    it('requires a question for the ask action', () => {
        const result = analyzeRequestSchema.safeParse({ ...base, action: 'ask' });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.some((i) => i.path.includes('question'))).toBe(true);
        }
    });

    it('accepts the ask action when a question is provided', () => {
        expect(
            analyzeRequestSchema.safeParse({ ...base, action: 'ask', question: 'Why?' }).success,
        ).toBe(true);
    });

    it('rejects an over-long question', () => {
        expect(
            analyzeRequestSchema.safeParse({
                ...base,
                action: 'ask',
                question: 'x'.repeat(2001),
            }).success,
        ).toBe(false);
    });
});
