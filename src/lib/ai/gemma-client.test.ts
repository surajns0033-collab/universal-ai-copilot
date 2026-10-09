import { describe, expect, it } from 'vitest';
import { GemmaClient, normalizeProviderError } from './gemma-client';
import { testServerConfig } from '@/tests/fixtures';
import type { GenAiClientLike } from './gemma-client';

describe('normalizeProviderError', () => {
    it('maps 429 to AI_RATE_LIMITED', () => {
        const err = normalizeProviderError(Object.assign(new Error('nope'), { status: 429 }));
        expect(err.code).toBe('AI_RATE_LIMITED');
    });

    it('maps 401/403 to CONFIGURATION_ERROR', () => {
        expect(normalizeProviderError(Object.assign(new Error('x'), { status: 401 })).code).toBe(
            'CONFIGURATION_ERROR',
        );
        expect(normalizeProviderError(Object.assign(new Error('x'), { status: 403 })).code).toBe(
            'CONFIGURATION_ERROR',
        );
    });

    it('maps 5xx to AI_UNAVAILABLE', () => {
        expect(normalizeProviderError(Object.assign(new Error('x'), { status: 503 })).code).toBe(
            'AI_UNAVAILABLE',
        );
    });

    it('detects a status embedded in the message', () => {
        expect(normalizeProviderError(new Error('request failed, status: 429')).code).toBe(
            'AI_RATE_LIMITED',
        );
    });

    it('defaults to AI_UNAVAILABLE for unknown errors', () => {
        expect(normalizeProviderError(new Error('mystery')).code).toBe('AI_UNAVAILABLE');
    });

    it('does not leak provider internals in the safe message', () => {
        const err = normalizeProviderError(new Error('secret internal detail 12345'));
        expect(err.message).not.toContain('secret internal detail');
    });
});

describe('GemmaClient', () => {
    it('forwards the attached source as inline data', async () => {
        let captured: Record<string, unknown> | undefined;
        const client: GenAiClientLike = {
            models: {
                generateContent: async (args) => {
                    captured = args as unknown as Record<string, unknown>;
                    return { text: '{"ok":true}' };
                },
            },
        };
        const gemma = new GemmaClient(testServerConfig, client);
        const response = await gemma.generate({
            systemInstruction: 'sys',
            userText: 'hello',
            source: { filename: 'a.png', mimeType: 'image/png', sizeBytes: 3, kind: 'image' },
            dataBase64: 'AAA=',
        });

        expect(response.text).toBe('{"ok":true}');
        expect(captured?.model).toBe('gemma-test-model');
    });

    it('times out slow provider calls', async () => {
        let capturedReject: ((reason?: unknown) => void) | undefined;
        const slow: GenAiClientLike = {
            models: {
                generateContent: () =>
                    new Promise<{ text: string }>((_resolve, reject) => {
                        capturedReject = reject;
                    }),
            },
        };
        const gemma = new GemmaClient({ ...testServerConfig, requestTimeoutMs: 20 }, slow);
        await expect(
            gemma.generate({
                systemInstruction: 'sys',
                userText: 'hi',
                source: { filename: 'a.txt', mimeType: 'text/plain', sizeBytes: 1, kind: 'document' },
                dataBase64: 'AA==',
            }),
        ).rejects.toMatchObject({ code: 'AI_TIMEOUT' });
        // Settle the dangling provider promise so it does not leak between tests.
        capturedReject?.(new Error('late'));
    });
});
