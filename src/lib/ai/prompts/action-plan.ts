import { composePrompt, type PromptParts } from './base';

export function buildActionPlanPrompt(): PromptParts {
    return composePrompt(
        'action-plan',
        [
            'Derive a practical action plan from the attached source.',
            '- "title": a short descriptive title.',
            '- "summary": one-sentence statement of the goal implied by the source.',
            '- "actions": an ordered list of 4-8 concrete, prioritised steps.',
            'Each step must be specific and directly grounded in the source content.',
            'Leave quiz and answer empty.',
        ].join('\n'),
    );
}
