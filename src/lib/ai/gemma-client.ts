/**
 * Gemma client — the single point of contact with the AI provider.
 *
 * Architecture note:
 *   UI → Application Service → AiService → GemmaClient → Gemini API → Gemma
 *
 * This module is server-only. It wraps the official Google GenAI SDK and is
 * responsible for:
 *   - constructing multimodal requests (text + inline file data)
 *   - requesting JSON output
 *   - normalising provider errors into typed {@link AppError}s
 *   - enforcing a request timeout
 *
 * No component or route handler imports the provider SDK directly.
 */
import { GoogleGenAI } from '@google/genai';
import type { SourceDescriptor } from '@/types/ai';
import { AiServiceError } from '@/lib/errors';
import type { ServerConfig } from '@/config/env';

/** Describes a single model call, independent of the provider SDK. */
export interface GemmaRequest {
    systemInstruction: string;
    userText: string;
    source: SourceDescriptor;
    /** Base64-encoded bytes of the source file (no data-URL prefix). */
    dataBase64: string;
}

/** The raw textual response from the model. */
export interface GemmaResponse {
    text: string;
}

/** Minimal shape we depend on from the SDK, to keep the adapter testable. */
export interface GenAiClientLike {
    models: {
        generateContent: (args: {
            model: string;
            contents: unknown;
            config?: Record<string, unknown>;
        }) => Promise<GenerateContentResultLike>;
    };
}

interface GenerateContentResultLike {
    text?: string;
}

/**
 * Gemma client bound to a provider instance and configuration.
 */
export class GemmaClient {
    private readonly client: GenAiClientLike;
    private readonly model: string;
    private readonly timeoutMs: number;

    constructor(config: ServerConfig, client?: GenAiClientLike) {
        this.model = config.gemmaModel;
        this.timeoutMs = config.requestTimeoutMs;
        this.client =
            client ??
            (new GoogleGenAI({ apiKey: config.geminiApiKey }) as unknown as GenAiClientLike);
    }

    /** The model identifier in use (configuration-sourced, never hardcoded). */
    get modelName(): string {
        return this.model;
    }

    /**
     * Run a multimodal generation and return the raw text.
     *
     * @throws {AiServiceError} for provider availability problems.
     * @throws {AiOutputError}  never — parsing is handled separately by the caller.
     */
    async generate(request: GemmaRequest): Promise<GemmaResponse> {
        const parts: Array<Record<string, unknown>> = [{ text: request.userText }];

        // Attach the file as inline data. The SDK accepts base64 payloads directly
        // for both images and PDFs, which is the documented mechanism for
        // multimodal document understanding.
        parts.push({
            inlineData: {
                mimeType: request.source.mimeType,
                data: request.dataBase64,
            },
        });

        try {
            const result = await this.withTimeout(
                this.client.models.generateContent({
                    model: this.model,
                    contents: [{ role: 'user', parts }],
                    config: {
                        systemInstruction: request.systemInstruction,
                        // Ask the provider to constrain output to JSON. We still validate
                        // and recover defensively because this is not guaranteed.
                        responseMimeType: 'application/json',
                        temperature: 0.2,
                        topP: 0.9,
                        maxOutputTokens: 4096,
                    },
                }),
            );

            const text = extractText(result);
            return { text };
        } catch (error) {
            throw normalizeProviderError(error);
        }
    }

    /** Race the provider call against a timeout. */
    private async withTimeout<T>(promise: Promise<T>): Promise<T> {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const timeout = new Promise<never>((_, reject) => {
            timer = setTimeout(
                () =>
                    reject(
                        new AiServiceError(
                            'AI_TIMEOUT',
                            'The AI service took too long to respond. Please retry.',
                        ),
                    ),
                this.timeoutMs,
            );
        });
        try {
            return await Promise.race([promise, timeout]);
        } finally {
            if (timer) clearTimeout(timer);
        }
    }
}

/** Extract text from the SDK result, tolerating minor shape differences. */
function extractText(result: GenerateContentResultLike): string {
    if (typeof result?.text === 'string') return result.text;
    // Fallback: some SDK versions expose candidates → content → parts → text.
    const anyResult = result as unknown as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const parts = anyResult?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts)) {
        return parts.map((p) => p?.text ?? '').join('');
    }
    return '';
}

/**
 * Map arbitrary provider errors to typed application errors with safe messages.
 * Raw provider text is attached as `cause` for server-side logging only.
 */
export function normalizeProviderError(error: unknown): AiServiceError {
    if (error instanceof AiServiceError) return error;

    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();
    const status = extractStatus(error);

    if (status === 429 || lower.includes('rate limit') || lower.includes('quota')) {
        return new AiServiceError(
            'AI_RATE_LIMITED',
            'The AI service is temporarily rate-limited. Please retry in a moment.',
            error,
        );
    }
    if (status === 401 || status === 403 || lower.includes('api key') || lower.includes('permission')) {
        return new AiServiceError(
            'CONFIGURATION_ERROR',
            'The AI service rejected the configured credentials. Check the server API key.',
            error,
        );
    }
    if (status === 404 || lower.includes('not found') || lower.includes('model')) {
        return new AiServiceError(
            'CONFIGURATION_ERROR',
            'The configured Gemma model is unavailable. Verify the GEMMA_MODEL value.',
            error,
        );
    }
    if (typeof status === 'number' && status >= 500) {
        return new AiServiceError(
            'AI_UNAVAILABLE',
            'The AI service is currently unavailable. Please retry shortly.',
            error,
        );
    }
    return new AiServiceError(
        'AI_UNAVAILABLE',
        'The AI service could not complete the request. Please retry.',
        error,
    );
}

/** Best-effort extraction of an HTTP-like status from a provider error. */
function extractStatus(error: unknown): number | undefined {
    if (typeof error !== 'object' || error === null) return undefined;
    const candidate = error as { status?: unknown; code?: unknown; response?: unknown };
    if (typeof candidate.status === 'number') return candidate.status;
    if (typeof candidate.code === 'number') return candidate.code;
    const response = candidate.response as { status?: unknown } | undefined;
    if (response && typeof response.status === 'number') return response.status;
    // Some SDK errors embed the status in the message: "...status: 429..."
    if (error instanceof Error) {
        const match = /status[:= ]+(\d{3})/i.exec(error.message);
        if (match) return Number(match[1]);
    }
    return undefined;
}
