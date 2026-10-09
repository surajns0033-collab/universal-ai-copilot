/**
 * POST /api/analyze
 *
 * Thin HTTP adapter. All business logic lives in the application service and AI
 * layer; this handler only:
 *   - runs on the server (Node runtime) so secrets never reach the browser
 *   - loads + validates configuration
 *   - delegates to {@link handleAnalyze}
 *   - serialises a uniform response
 */
import type { NextRequest } from 'next/server';
import { handleAnalyze } from '@/services/analyze-service';
import { getServerConfig } from '@/config/env';
import { createAiService } from '@/lib/ai';
import { jsonFromError, jsonSuccess } from '@/lib/http/responses';
import { ValidationError } from '@/lib/errors';

// The AI SDK requires the Node.js runtime (not Edge).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<Response> {
    try {
        const config = getServerConfig();

        let payload: unknown;
        try {
            payload = await request.json();
        } catch {
            return jsonFromError(new ValidationError('Malformed JSON body.'));
        }

        const aiService = createAiService(config);
        const data = await handleAnalyze(payload, {
            aiService,
            maxUploadBytes: config.maxUploadBytes,
        });

        return jsonSuccess(data);
    } catch (err) {
        return jsonFromError(err);
    }
}

/** Health/config probe. Does not reveal secrets — only whether config is present. */
export async function GET(): Promise<Response> {
    try {
        const config = getServerConfig();
        return jsonSuccess({
            ready: true,
            model: config.gemmaModel,
            maxUploadBytes: config.maxUploadBytes,
        });
    } catch (err) {
        return jsonFromError(err);
    }
}
