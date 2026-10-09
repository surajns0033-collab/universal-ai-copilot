import { composePrompt, type PromptParts } from './base';

export function buildAnalyzePrompt(): PromptParts {
    return composePrompt(
        'analyze',
        [
            'Perform a full multimodal analysis of the attached source.',
            '- "title": a short descriptive title.',
            '- "summary": 3-6 sentences covering the essential content.',
            '- "keyPoints": 4-8 of the most important points.',
            '- "explanation": a clear explanation of what the source is about.',
            '- "actions": 3-6 concrete, actionable next steps a reader could take based',
            '  on this content.',
            'Leave quiz and answer empty.',
        ].join('\n'),
    );
}
