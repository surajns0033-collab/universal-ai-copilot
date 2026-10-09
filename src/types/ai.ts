/**
 * Domain types for the AI layer.
 *
 * These types describe *what the AI produces* as understood by the application.
 * They are intentionally decoupled from any provider SDK so the application
 * layer and UI never depend on Gemini/Gemma specifics.
 */

/** The set of user-invokable AI operations. */
export const AI_ACTIONS = [
    'analyze',
    'summarize',
    'explain',
    'quiz',
    'action-plan',
    'ask',
] as const;

export type AiAction = (typeof AI_ACTIONS)[number];

/**
 * Runtime-checkable list used by validators. Kept as a separate export so it
 * remains usable in vanilla JS contexts (e.g. a future CLI) without TS.
 */
export const AI_ACTION_VALUES: readonly AiAction[] = AI_ACTIONS;

/** A single question/answer pair produced by the quiz generator. */
export interface QuizItem {
    question: string;
    answer: string;
    /** Optional supporting detail or explanation for the answer. */
    explanation?: string;
}

/** Qualitative confidence the model assigns to its own structured output. */
export type Confidence = 'high' | 'medium' | 'low';

/**
 * The canonical structured result returned by the multimodal understanding
 * pipeline. Not every action populates every field; `analyze` populates the
 * full object, while focused actions (summarize/quiz/...) populate a subset.
 */
export interface AnalysisResult {
    title: string;
    summary: string;
    keyPoints: string[];
    explanation: string;
    actions: string[];
    quiz: QuizItem[];
    confidence: Confidence;
    /** Present for the `ask` action: the direct answer to the user's question. */
    answer?: string;
    /** Free-form note, e.g. "source did not contain enough information". */
    notes?: string;
}

/** Metadata describing the source passed to the AI. */
export interface SourceDescriptor {
    /** Original filename, sanitised for display. */
    filename: string;
    /** Detected MIME type. */
    mimeType: string;
    /** Size of the raw bytes in bytes. */
    sizeBytes: number;
    /** How the file is presented to the model. */
    kind: 'image' | 'document';
}

/** Input required to run a single AI action. */
export interface RunActionInput {
    action: AiAction;
    source: SourceDescriptor;
    /** Base64-encoded file content (no data-URL prefix). */
    dataBase64: string;
    /** Only used by the `ask` action. */
    question?: string;
}

/** Result wrapper returned from the AI service to the application layer. */
export interface RunActionResult {
    action: AiAction;
    result: AnalysisResult;
    /** The model identifier actually used (from configuration). */
    model: string;
    /** Wall-clock duration of the provider call in milliseconds. */
    durationMs: number;
}
