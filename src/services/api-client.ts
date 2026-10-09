/**
 * Browser-side API client.
 *
 * The only place the UI talks to the backend. It converts the uniform
 * ApiResponse contract into either resolved data or a thrown
 * {@link ClientError}, so components/hooks handle a single error path.
 */
import type { AiAction, AnalysisResult, ApiResponse, AnalyzeResponseData } from '@/types/api';
import type { SourceDescriptor } from '@/types/ai';

export class ClientError extends Error {
    readonly code: string;
    readonly details?: Record<string, string>;

    constructor(code: string, message: string, details?: Record<string, string>) {
        super(message);
        this.name = 'ClientError';
        this.code = code;
        this.details = details;
    }
}

export interface RunActionRequest {
    action: AiAction;
    source: SourceDescriptor;
    dataBase64: string;
    question?: string;
}

export interface RunActionOutcome {
    result: AnalysisResult;
    model: string;
    durationMs: number;
}

/**
 * Invoke the analyze API.
 *
 * @throws {ClientError} on any failure (network, validation, AI availability).
 */
export async function runAction(request: RunActionRequest): Promise<RunActionOutcome> {
    let response: Response;
    try {
        response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: request.action,
                filename: request.source.filename,
                mimeType: request.source.mimeType,
                sizeBytes: request.source.sizeBytes,
                dataBase64: request.dataBase64,
                ...(request.question ? { question: request.question } : {}),
            }),
        });
    } catch {
        throw new ClientError('NETWORK_ERROR', 'Could not reach the server. Check your connection.');
    }

    let payload: ApiResponse<AnalyzeResponseData> | null = null;
    try {
        payload = (await response.json()) as ApiResponse<AnalyzeResponseData>;
    } catch {
        throw new ClientError('SERVER_ERROR', 'The server returned an unreadable response.');
    }

    if (!payload || payload.success !== true) {
        const error = payload && payload.success === false ? payload.error : undefined;
        throw new ClientError(
            error?.code ?? 'SERVER_ERROR',
            error?.message ?? 'The request failed. Please retry.',
            error?.details,
        );
    }

    return {
        result: payload.data.result,
        model: payload.data.model,
        durationMs: payload.data.durationMs,
    };
}
