import { composePrompt, type PromptParts } from './base';

/**
 * Build the question-answering prompt.
 *
 * @param question - The user's question. Grounding rules in the preamble
 *                   instruct the model to answer only from the source and to
 *                   declare insufficiency in `notes` when applicable.
 */
export function buildAskPrompt(question: string): PromptParts {
    return composePrompt(
        'ask',
        [
            'Answer the user question below using ONLY the attached source.',
            '- "answer": a direct, concise answer.',
            '- "explanation": supporting reasoning drawn from the source.',
            '- "keyPoints": any specific facts used, as short strings.',
            'If the source does not contain the answer, set "answer" to a brief',
            'statement that the information is not present, and set "notes" to',
            'explain what is missing. Do not guess.',
        ].join('\n'),
        question,
    );
}
