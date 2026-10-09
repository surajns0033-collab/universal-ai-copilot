/**
 * Wire-level types for the application HTTP API.
 *
 * These types are the contract between the browser (client service layer) and
 * the Next.js route handlers (server). Keeping them in one place prevents
 * client/server drift.
 */
import type { AiAction, AnalysisResult, QuizItem } from './ai';

/** Machine-readable error codes surfaced to clients. */
export type ApiErrorCode =
    | 'VALIDATION_ERROR'
    | 'UNSUPPORTED_FILE_TYPE'
    | 'FILE_TOO_LARGE'
    | 'EMPTY_FILE'
    | 'CONFIGURATION_ERROR'
    | 'AI_RATE_LIMITED'
    | 'AI_TIMEOUT'
    | 'AI_UNAVAILABLE'
    | 'AI_INVALID_OUTPUT'
    | 'NETWORK_ERROR'
    | 'SERVER_ERROR';

/** A safe, user-presentable error payload. Never leaks provider internals. */
export interface ApiError {
    code: ApiErrorCode;
    message: string;
    /** Optional field-level details for validation failures. */
    details?: Record<string, string>;
}

export interface ApiSuccess<T> {
    success: true;
    data: T;
}

export interface ApiFailure {
    success: false;
    error: ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Response payload for the `/api/analyze` route. */
export interface AnalyzeResponseData {
    action: AiAction;
    result: AnalysisResult;
    model: string;
    durationMs: number;
}

/** Metadata sent alongside the file describing the source to the server. */
export interface SourceMeta {
    filename: string;
    mimeType: string;
    sizeBytes: number;
}

/** Re-exported for convenience on the client. */
export type { AiAction, AnalysisResult, QuizItem };
