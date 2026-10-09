/**
 * Deterministic test fixtures. No live API calls are made anywhere in the suite.
 */
import type { AnalysisResult } from '@/types/ai';
import type { GenAiClientLike } from '@/lib/ai/gemma-client';

/** A well-formed structured result. */
export const validResult: AnalysisResult = {
    title: 'Quarterly Report',
    summary: 'Revenue grew 12% quarter over quarter.',
    keyPoints: ['Revenue up 12%', 'Churn down 2%', 'New markets entered'],
    explanation: 'The report covers financial performance.',
    actions: ['Review churn drivers', 'Plan Q3 expansion'],
    quiz: [
        { question: 'How much did revenue grow?', answer: '12%', explanation: 'Stated in the summary.' },
    ],
    confidence: 'high',
};

/** JSON text matching the schema, as a model might return it. */
export const validJsonText = JSON.stringify(validResult);

/** JSON wrapped in a markdown fence. */
export const fencedJsonText = `\`\`\`json\n${validJsonText}\n\`\`\``;

/** JSON embedded in prose. */
export const proseWrappedJsonText = `Here is the analysis you requested:\n${validJsonText}\nLet me know if you need more.`;

/** Non-JSON prose response. */
export const proseText = 'The document discusses quarterly revenue growth and market expansion.';

/** A partial object missing several fields. */
export const partialJsonText = JSON.stringify({
    title: 'Sparse',
    summary: 'Only a summary.',
    confidence: 'low',
});

/**
 * Build a fake GenAI client that returns a fixed text payload.
 * Used to exercise the GemmaClient/AiService without any network access.
 */
export function createFakeGenAiClient(text: string): GenAiClientLike {
    return {
        models: {
            generateContent: async () => ({ text }),
        },
    };
}

/** A fake client that always throws a rate-limit style error. */
export function createRateLimitedClient(): GenAiClientLike {
    return {
        models: {
            generateContent: async () => {
                throw Object.assign(new Error('429 Too Many Requests'), { status: 429 });
            },
        },
    };
}

/** Minimal server config for tests. */
export const testServerConfig = {
    geminiApiKey: 'test-key',
    gemmaModel: 'gemma-test-model',
    maxUploadBytes: 15 * 1024 * 1024,
    requestTimeoutMs: 5000,
};
