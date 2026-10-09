/**
 * Server-side environment configuration with fail-fast validation.
 *
 * Never import this module into client components — it reads secrets. It is
 * only consumed by server code (route handlers, services).
 */
import { z } from 'zod';
import { DEFAULT_GEMMA_MODEL, DEFAULT_MAX_UPLOAD_MB } from './constants';
import { ConfigurationError } from '@/lib/errors';

const envSchema = z.object({
    GEMINI_API_KEY: z
        .string({ required_error: 'GEMINI_API_KEY is required.' })
        .min(1, 'GEMINI_API_KEY must not be empty.'),
    // Gemma 4 is the default core model; callers may point at another Gemma
    // variant by setting GEMMA_MODEL. Never hardcoded in feature logic.
    GEMMA_MODEL: z.string().min(1, 'GEMMA_MODEL must not be empty.').default(DEFAULT_GEMMA_MODEL),
    MAX_UPLOAD_MB: z.coerce.number().positive().optional().default(DEFAULT_MAX_UPLOAD_MB),
    AI_REQUEST_TIMEOUT_MS: z.coerce.number().positive().optional().default(45_000),
});

export type ServerConfig = {
    geminiApiKey: string;
    gemmaModel: string;
    maxUploadBytes: number;
    requestTimeoutMs: number;
};

let cached: ServerConfig | null = null;

/**
 * Parse and validate process.env. Throws a {@link ConfigurationError} with an
 * actionable message when a required variable is missing, so misconfiguration
 * fails loudly at first use rather than producing confusing runtime errors.
 *
 * @param env - Injectable environment (defaults to process.env) for testing.
 */
export function loadServerConfig(
    env: Record<string, string | undefined> = process.env,
): ServerConfig {
    const parsed = envSchema.safeParse(env);

    if (!parsed.success) {
        const missing = parsed.error.issues
            .map((issue) => `  - ${issue.path.join('.') || 'env'}: ${issue.message}`)
            .join('\n');
        throw new ConfigurationError(
            `Invalid server configuration. Check your environment variables:\n${missing}\n` +
            'Copy .env.example to .env.local and set the required values.',
        );
    }

    return {
        geminiApiKey: parsed.data.GEMINI_API_KEY,
        gemmaModel: parsed.data.GEMMA_MODEL,
        maxUploadBytes: parsed.data.MAX_UPLOAD_MB * 1024 * 1024,
        requestTimeoutMs: parsed.data.AI_REQUEST_TIMEOUT_MS,
    };
}

/** Cached accessor used by server code paths. */
export function getServerConfig(): ServerConfig {
    if (!cached) {
        cached = loadServerConfig();
    }
    return cached;
}

/** Reset the cache. Intended for tests only. */
export function __resetServerConfigCache(): void {
    cached = null;
}
