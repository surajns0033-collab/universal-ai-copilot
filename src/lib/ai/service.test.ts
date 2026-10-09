import { describe, expect, it } from 'vitest';
import { AiService } from './service';
import { GemmaClient } from './gemma-client';
import { AiOutputError, AppError } from '@/lib/errors';
import {
    createFakeGenAiClient,
    createRateLimitedClient,
    testServerConfig,
    validJsonText,
} from '@/tests/fixtures';
import type { RunActionInput } from '@/types/ai';

const input: RunActionInput = {
    action: 'analyze',
    source: { filename: 'report.pdf', mimeType: 'application/pdf', sizeBytes: 1024, kind: 'document' },
    dataBase64: 'JVBERi0xLjQ=',
};

function makeService(text: string): AiService {
    const client = new GemmaClient(testServerConfig, createFakeGenAiClient(text));
    return new AiService(client);
}

describe('AiService', () => {
    it('returns a validated structured result on success', async () => {
        const service = makeService(validJsonText);
        const outcome = await service.run(input);

        expect(outcome.action).toBe('analyze');
        expect(outcome.model).toBe('gemma-test-model');
        expect(outcome.result.title).toBe('Quarterly Report');
        expect(outcome.durationMs).toBeGreaterThanOrEqual(0);
    });

    it('uses the configured model name', () => {
        const client = new GemmaClient(testServerConfig, createFakeGenAiClient(validJsonText));
        expect(client.modelName).toBe('gemma-test-model');
    });

    it('throws AiOutputError on an empty response', async () => {
        const service = makeService('   ');
        await expect(service.run(input)).rejects.toBeInstanceOf(AiOutputError);
    });

    it('degrades gracefully when the model returns non-JSON prose', async () => {
        const service = makeService('Just some prose without structure.');
        const outcome = await service.run(input);
        // No throw: fallback result is returned so the UI stays functional.
        expect(outcome.result.confidence).toBe('low');
        expect(outcome.result.summary).toContain('prose');
    });

    it('surfaces provider rate limits as AI_RATE_LIMITED', async () => {
        const client = new GemmaClient(testServerConfig, createRateLimitedClient());
        const service = new AiService(client);

        try {
            await service.run(input);
            throw new Error('should have thrown');
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);
            expect((err as AppError).code).toBe('AI_RATE_LIMITED');
            expect((err as AppError).status).toBe(429);
        }
    });

    it('passes the question through for the ask action', async () => {
        const service = makeService(validJsonText);
        const outcome = await service.run({ ...input, action: 'ask', question: 'Why?' });
        expect(outcome.action).toBe('ask');
    });
});
