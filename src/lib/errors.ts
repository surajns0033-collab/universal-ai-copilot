/**
 * Typed application error hierarchy.
 *
 * Every expected failure mode maps to an {@link AppError} subclass carrying a
 * machine-readable `code`, a safe user-facing `message`, and an HTTP `status`.
 * Route handlers convert these into the uniform API error envelope
 * ({@link ApiError}); raw provider internals are never forwarded to clients —
 * they travel on `cause` for server-side logging only.
 *
 * Design notes:
 *   - Extends `Error` so it works with `instanceof`, stack traces and
 *     `try/catch`.
 *   - `status` is explicit per error, avoiding scattered status logic.
 *   - `details` supports field-level validation feedback.
 */
import type { ApiError, ApiErrorCode } from '@/types/api';

export interface AppErrorOptions {
    /** Field-level details (used by validation errors). */
    details?: Record<string, string>;
    /** Underlying cause, retained for server-side logging only. */
    cause?: unknown;
}

/** Base class for all expected application errors. */
export class AppError extends Error {
    readonly code: ApiErrorCode;
    readonly status: number;
    readonly details?: Record<string, string>;

    constructor(
        code: ApiErrorCode,
        message: string,
        status = 400,
        options: AppErrorOptions = {},
    ) {
        super(message);
        this.name = new.target.name;
        this.code = code;
        this.status = status;
        this.details = options.details;
        if (options.cause !== undefined) {
            // `cause` is standard on Error in ES2022.
            (this as { cause?: unknown }).cause = options.cause;
        }
    }

    /** Convert to the safe, serialisable wire representation. */
    toApiError(): ApiError {
        return {
            code: this.code,
            message: this.message,
            ...(this.details ? { details: this.details } : {}),
        };
    }
}

/** Provider availability / configuration failures (Gemini API → Gemma). */
export class AiServiceError extends AppError {
    constructor(
        code: Extract<
            ApiErrorCode,
            'AI_RATE_LIMITED' | 'AI_TIMEOUT' | 'AI_UNAVAILABLE' | 'CONFIGURATION_ERROR'
        >,
        message: string,
        cause?: unknown,
    ) {
        // 429 for rate limits, 503 for transient unavailability, 400 otherwise
        // (configuration errors are actionable client-visible misconfiguration).
        const status =
            code === 'AI_RATE_LIMITED' ? 429 : code === 'AI_UNAVAILABLE' || code === 'AI_TIMEOUT' ? 503 : 400;
        super(code, message, status, { cause });
    }
}

/** The model returned empty or unparseable output. */
export class AiOutputError extends AppError {
    constructor(message: string, cause?: unknown) {
        super('AI_INVALID_OUTPUT', message, 502, { cause });
    }
}

/** Request payload failed validation. */
export class ValidationError extends AppError {
    constructor(message: string, details?: Record<string, string>, cause?: unknown) {
        super('VALIDATION_ERROR', message, 400, { details, cause });
    }
}

/** Server misconfiguration (missing/invalid environment variables). */
export class ConfigurationError extends AppError {
    constructor(message: string, cause?: unknown) {
        super('CONFIGURATION_ERROR', message, 500, { cause });
    }
}

/**
 * Normalise any thrown value into an {@link AppError}.
 *
 * Unknown errors become a generic server error so no unexpected shape can
 * bypass the typed handling in route handlers.
 */
export function toAppError(err: unknown): AppError {
    if (err instanceof AppError) return err;
    if (err instanceof Error) {
        return new AppError('SERVER_ERROR', 'An unexpected server error occurred.', 500, { cause: err });
    }
    return new AppError('SERVER_ERROR', 'An unexpected server error occurred.', 500);
}
