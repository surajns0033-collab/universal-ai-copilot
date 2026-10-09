import { composePrompt, type PromptParts } from './base';

export function buildExplainPrompt(): PromptParts {
    return composePrompt(
        'explain',
        [
            'Explain the attached source in clear, plain language for a general reader.',
            '- "title": a short descriptive title.',
            '- "explanation": a structured, easy-to-follow explanation.',
            '- "keyPoints": 3-6 short takeaways.',
            'Define jargon in simple terms where it appears. Do not add facts that are',
            'not present in the source. Leave quiz, actions and answer empty.',
        ].join('\n'),
    );
}
