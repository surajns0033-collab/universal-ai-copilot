/**
 * Prompt registry.
 *
 * Maps each AI action to its prompt builder. This is the only place the
 * application layer consults to obtain a prompt, keeping prompt logic entirely
 * out of components and route handlers.
 */
import type { AiAction } from '@/types/ai';
import type { PromptParts } from './base';
import { buildAnalyzePrompt } from './analyze';
import { buildSummarizePrompt } from './summarize';
import { buildExplainPrompt } from './explain';
import { buildQuizPrompt } from './quiz';
import { buildActionPlanPrompt } from './action-plan';
import { buildAskPrompt } from './ask';

export type { PromptParts } from './base';
export { SYSTEM_PREAMBLE } from './base';

/**
 * Resolve the prompt for an action.
 *
 * @param action   - Which AI action to run.
 * @param question - Required for the `ask` action.
 */
export function buildPromptForAction(action: AiAction, question?: string): PromptParts {
    switch (action) {
        case 'analyze':
            return buildAnalyzePrompt();
        case 'summarize':
            return buildSummarizePrompt();
        case 'explain':
            return buildExplainPrompt();
        case 'quiz':
            return buildQuizPrompt();
        case 'action-plan':
            return buildActionPlanPrompt();
        case 'ask':
            return buildAskPrompt(question ?? '');
        default: {
            // Exhaustiveness guard.
            const never: never = action;
            throw new Error(`No prompt builder registered for action: ${String(never)}`);
        }
    }
}
