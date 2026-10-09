import { composePrompt, type PromptParts } from './base';

export function buildSummarizePrompt(): PromptParts {
    return composePrompt(
        'summarize',
        [
            'Produce a concise, faithful summary of the attached source.',
            '- "title": a short descriptive title.',
            '- "summary": 3-6 sentences covering the essential content.',
            '- "keyPoints": 3-7 of the most important points as standalone strings.',
            'Leave quiz, actions and answer empty.',
        ].join('\n'),
    );
}
