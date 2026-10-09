import { composePrompt, type PromptParts } from './base';

export function buildQuizPrompt(): PromptParts {
    return composePrompt(
        'quiz',
        [
            'Create a study quiz from the attached source.',
            '- "title": a short descriptive title.',
            '- "quiz": 5 question/answer pairs testing comprehension of the source.',
            '  Each item must include a short "explanation" of the correct answer.',
            'Only ask questions whose answers are verifiable from the source.',
            'Leave summary, keyPoints, actions and answer empty.',
        ].join('\n'),
    );
}
