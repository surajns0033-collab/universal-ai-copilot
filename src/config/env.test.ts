import { describe, expect, it } from 'vitest';
import { loadServerConfig } from './env';
import { ConfigurationError } from '@/lib/errors';

const validEnv = {
    GEMINI_API_KEY: 'secret-key',
    GEMMA_MODEL: 'gemma-model-x',
};

describe('loadServerConfig', () => {
    it('loads and derives a valid configuration', () => {
        const config = loadServerConfig(validEnv);
        expect(config.geminiApiKey).toBe('secret-key');
        expect(config.gemmaModel).toBe('gemma-model-x');
        expect(config.maxUploadBytes).toBe(15 * 1024 * 1024);
        expect(config.requestTimeoutMs).toBeGreaterThan(0);
    });

    it('honours overrides for size and timeout', () => {
        const config = loadServerConfig({
            ...validEnv,
            MAX_UPLOAD_MB: '5',
            AI_REQUEST_TIMEOUT_MS: '1000',
        });
        expect(config.maxUploadBytes).toBe(5 * 1024 * 1024);
        expect(config.requestTimeoutMs).toBe(1000);
    });

    it('throws ConfigurationError when the API key is missing', () => {
        expect(() => loadServerConfig({ GEMMA_MODEL: 'x' })).toThrowError(ConfigurationError);
    });

    it('defaults the model to Gemma 4 when GEMMA_MODEL is not set', () => {
        const config = loadServerConfig({ GEMINI_API_KEY: 'x' });
        expect(config.gemmaModel).toBe('gemma-4-26b-a4b-it');
    });

    it('rejects a non-numeric size override', () => {
        expect(() => loadServerConfig({ ...validEnv, MAX_UPLOAD_MB: 'abc' })).toThrowError(
            ConfigurationError,
        );
    });
});
