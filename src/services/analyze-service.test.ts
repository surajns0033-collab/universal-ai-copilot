import { describe, expect, it } from 'vitest';
import { handleAnalyze } from './analyze-service';
import { AiService } from '@/lib/ai/service';
import { GemmaClient } from '@/lib/ai/gemma-client';
import { AppError } from '@/lib/errors';
import {
    createFakeGenAiClient,
    createRateLimitedClient,
    testServerConfig,
    validJsonText,
} from '@/tests/fixtures';
import type { AnalyzeRequestPayload } from './analyze-service';

const payload: AnalyzeRequestPayload = {
    action: 'analyze',
    filename: 'report.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
    dataBase64: 'JVBERi0=',
};

const deps = (text: string) => ({
    aiService: new AiService(new GemmaClient(testServerConfig, createFakeGenAiClient(text))),
    maxUploadBytes: testServerConfig.maxUploadBytes,
});

describe('handleAnalyze', () => {
    it('returns structured data for a valid request', async () => {
        const data = await handleAnalyze(payload, deps(validJsonText));
        expect(data.action).toBe('analyze');
        expect(data.model).toBe('gemma-test-model');
        expect(data.result.title).toBe('Quarterly Report');
    });

    it('rejects a structurally invalid payload with VALIDATION_ERROR', async () => {
        await expect(handleAnalyze({ ...payload, action: 'nope' }, deps(validJsonText))).rejects.toMatchObject(
            { code: 'VALIDATION_ERROR' },
        );
    });

    it('enforces the server-side size limit', async () => {
        await expect(
            handleAnalyze({ ...payload, sizeBytes: testServerConfig.maxUploadBytes + 1 }, deps(validJsonText)),
        ).rejects.toMatchObject({ code: 'FILE_TOO_LARGE' });
    });

    it('rejects an unsupported file type at the service boundary', async () => {
        await expect(
            handleAnalyze({ ...payload, filename: 'evil.exe', mimeType: 'application/pdf' }, deps(validJsonText)),
        ).rejects.toBeInstanceOf(AppError);
    });

    it('propagates provider availability errors unchanged', async () => {
        const failing = {
            aiService: new AiService(new GemmaClient(testServerConfig, createRateLimitedClient())),
            maxUploadBytes: testServerConfig.maxUploadBytes,
        };
        await expect(handleAnalyze(payload, failing)).rejects.toMatchObject({ code: 'AI_RATE_LIMITED' });
    });

    it('requires a question for the ask action', async () => {
        await expect(handleAnalyze({ ...payload, action: 'ask' }, deps(validJsonText))).rejects.toMatchObject(
            { code: 'VALIDATION_ERROR' },
        );
    });
});
