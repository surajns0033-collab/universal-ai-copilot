/**
 * AI application service.
 *
 * Orchestrates a single AI action end-to-end:
 *   1. build the prompt for the requested action
 *   2. call the Gemma client (Gemini API → Gemma)
 *   3. parse + validate the structured response (with recovery/fallback)
 *   4. return a typed {@link RunActionResult}
 *
 * The service depends on the {@link GemmaClient} abstraction, enabling
 * deterministic tests with a fake client and no live API calls.
 */
import type { RunActionInput, RunActionResult } from '@/types/ai';
import { AiOutputError } from '@/lib/errors';
import { buildPromptForAction } from './prompts';
import { parseAnalysisResult } from './parser';
import { GemmaClient } from './gemma-client';

export class AiService {
    private readonly client: GemmaClient;

    constructor(client: GemmaClient) {
        this.client = client;
    }

    /**
     * Execute one AI action against the supplied source.
     *
     * @throws {AppError} typed errors for configuration/availability issues.
     *                    Malformed output never throws — it degrades to a
     *                    validated fallback so the UI stays functional.
     */
    async run(input: RunActionInput): Promise<RunActionResult> {
        const startedAt = Date.now();
        const { system, user } = buildPromptForAction(input.action, input.question);

        const response = await this.client.generate({
            systemInstruction: system,
            userText: user,
            source: input.source,
            dataBase64: input.dataBase64,
        });

        if (response.text.trim().length === 0) {
            // An empty response is a soft failure we can still surface safely.
            throw new AiOutputError('The AI returned an empty response. Please retry.');
        }

        const result = parseAnalysisResult(response.text);

        return {
            action: input.action,
            result,
            model: this.client.modelName,
            durationMs: Date.now() - startedAt,
        };
    }
}
