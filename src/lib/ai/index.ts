/**
 * Public surface of the AI layer.
 *
 * Consumers (route handlers, application services) import from here rather than
 * reaching into individual modules, keeping the internal structure free to
 * evolve.
 */
export { AiService } from './service';
export { GemmaClient } from './gemma-client';
export type { GenAiClientLike, GemmaRequest, GemmaResponse } from './gemma-client';
export { parseAnalysisResult, buildFallback } from './parser';
export { analysisResultSchema } from './schemas';
export { buildPromptForAction, SYSTEM_PREAMBLE } from './prompts';
export type { PromptParts } from './prompts';

/**
 * Factory that wires a ready-to-use AiService from a server configuration.
 * Kept here so route handlers never construct dependencies themselves.
 */
import type { ServerConfig } from '@/config/env';
import { GemmaClient as Client } from './gemma-client';
import { AiService as Service } from './service';

export function createAiService(config: ServerConfig): Service {
    return new Service(new Client(config));
}
