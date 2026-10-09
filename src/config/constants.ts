/**
 * Centralised, non-secret application constants.
 *
 * File constraints and action metadata live here so that UI, validation and
 * API layers all agree on the same rules (DRY, single source of truth).
 */
import type { AiAction } from '@/types/ai';

/** Accepted MIME types mapped to how the file is presented to the model. */
export const ACCEPTED_MIME_TYPES: Record<string, 'image' | 'document'> = {
    'image/png': 'image',
    'image/jpeg': 'image',
    'image/jpg': 'image',
    'application/pdf': 'document',
    'text/plain': 'document',
};

/** Accepted file extensions (lower-case, without the dot). */
export const ACCEPTED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg', 'txt'] as const;

/** Maximum accepted upload size in megabytes (overridable by env). */
export const DEFAULT_MAX_UPLOAD_MB = 15;

/**
 * Default Gemma model identifier used when `GEMMA_MODEL` is not set.
 *
 * Gemma 4 is the core intelligence of the application. The model name remains
 * fully configurable via the `GEMMA_MODEL` environment variable; this constant
 * is the single fallback so the name is never hardcoded in feature logic.
 */
export const DEFAULT_GEMMA_MODEL = 'gemma-4-26b-a4b-it';

/** Minimum byte count below which a file is considered empty. */
export const MIN_FILE_BYTES = 1;

/** Human-readable accept string for the file input element. */
export const FILE_INPUT_ACCEPT =
    '.pdf,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain';

export interface ActionDescriptor {
    id: AiAction;
    label: string;
    description: string;
    /** Whether this action needs a free-text question from the user. */
    requiresQuestion: boolean;
    /** Icon key resolved by the UI icon map. */
    icon: 'scan' | 'sparkles' | 'book' | 'help' | 'quiz' | 'checklist';
}

/** Ordered, user-facing action catalogue. Order defines UI presentation. */
export const ACTIONS: ActionDescriptor[] = [
    {
        id: 'analyze',
        label: 'Analyze',
        description: 'Full multimodal understanding: summary, key points, and actions.',
        requiresQuestion: false,
        icon: 'scan',
    },
    {
        id: 'summarize',
        label: 'Summarize',
        description: 'A concise summary of the source material.',
        requiresQuestion: false,
        icon: 'sparkles',
    },
    {
        id: 'explain',
        label: 'Explain',
        description: 'A plain-language explanation of the content.',
        requiresQuestion: false,
        icon: 'book',
    },
    {
        id: 'ask',
        label: 'Ask AI',
        description: 'Ask a specific question grounded in the uploaded content.',
        requiresQuestion: true,
        icon: 'help',
    },
    {
        id: 'quiz',
        label: 'Quiz',
        description: 'Generate question/answer pairs to test understanding.',
        requiresQuestion: false,
        icon: 'quiz',
    },
    {
        id: 'action-plan',
        label: 'Action Plan',
        description: 'Turn the content into a concrete, ordered list of next steps.',
        requiresQuestion: false,
        icon: 'checklist',
    },
];

/** Look up an action descriptor by id. */
export function getActionDescriptor(id: AiAction): ActionDescriptor | undefined {
    return ACTIONS.find((a) => a.id === id);
}
