/**
 * Helpers for producing consistent JSON API responses.
 *
 * Every route returns either:
 *   { success: true, data: ... }   or   { success: false, error: { code, message } }
 *
 * This uniformity lets the client service parse all endpoints identically and
 * guarantees we never leak raw provider internals or stack traces.
 */
import { NextResponse } from 'next/server';
import type { ApiError, ApiFailure, ApiSuccess } from '@/types/api';
import { AppError, toAppError } from '@/lib/errors';

export function jsonSuccess<T>(data: T, status = 200): NextResponse<ApiSuccess<T>> {
    return NextResponse.json({ success: true, data }, { status });
}

export function jsonFailure(error: ApiError, status: number): NextResponse<ApiFailure> {
    return NextResponse.json({ success: false, error }, { status });
}

/**
 * Convert any thrown value into a safe JSON error response.
 * Full details are logged server-side; only the safe message is returned.
 */
export function jsonFromError(err: unknown): NextResponse<ApiFailure> {
    const appError = toAppError(err);
    // Server-side diagnostics only. Never serialised to the client.
    console.error(`[api:${appError.code}]`, appError.message, appError.cause ?? '');
    return jsonFailure(appError.toApiError(), appError.status);
}

export { AppError };
