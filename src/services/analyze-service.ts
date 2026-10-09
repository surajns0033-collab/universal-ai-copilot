/**
 * Application service for the analyze flow.
 *
 * Pure orchestration, framework-agnostic (no Next.js imports) so it can be unit
 * and integration tested directly. The route handler is a thin adapter that
 * wires configuration + AiService and serialises the result.
 *
 * Responsibilities:
 *   - validate the incoming request payload
 *   - authoritatively re-validate the file (size, type)
 *   - invoke the AiService
 *   - map everything into the shared ApiResponse contract
 */
import type { AnalyzeResponseData, SourceMeta } from '@/types/api';
import { analyzeRequestSchema } from '@/lib/validation/request';
import { describeSource, validateFile } from '@/lib/files/validation';
import { ValidationError } from '@/lib/errors';
import type { AiService } from '@/lib/ai';
import type { AiAction } from '@/types/ai';

/** Raw inputs as received on the wire. */
export interface AnalyzeRequestPayload extends SourceMeta {
    action: AiAction;
    dataBase64: string;
    question?: string;
}

export interface AnalyzeServiceDeps {
    aiService: AiService;
    maxUploadBytes: number;
}

/**
 * Handle an analyze request.
 *
 * Returns the response data on success. All failure modes are expressed as
 * typed {@link AppError}s which the route adapter converts to safe responses.
 */
export async function handleAnalyze(
    payload: unknown,
    deps: AnalyzeServiceDeps,
): Promise<AnalyzeResponseData> {
    // 1. Structural validation.
    const parsed = analyzeRequestSchema.safeParse(payload);
    if (!parsed.success) {
        const details: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
            details[issue.path.join('.') || 'payload'] = issue.message;
        }
        throw new ValidationError('The request was invalid.', details);
    }

    const { action, filename, mimeType, sizeBytes, dataBase64, question } = parsed.data;

    // 2. Authoritative file validation on the server.
    validateFile({ filename, mimeType, sizeBytes }, deps.maxUploadBytes);
    const source = describeSource({ filename, mimeType, sizeBytes });

    // 3. Run the AI action.
    const outcome = await deps.aiService.run({
        action,
        source,
        dataBase64,
        question,
    });

    return {
        action: outcome.action,
        result: outcome.result,
        model: outcome.model,
        durationMs: outcome.durationMs,
    };
}
