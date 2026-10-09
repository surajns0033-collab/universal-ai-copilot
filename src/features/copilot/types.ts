/**
 * UI-facing state types for the copilot feature.
 */
import type { AiAction, AnalysisResult, SourceDescriptor } from '@/types/ai';

export type CopilotStatus = 'idle' | 'ready' | 'loading' | 'success' | 'error';

/** A file selected by the user, plus a local object URL for previewing. */
export interface SelectedFile {
    file: File;
    source: SourceDescriptor;
    /** Object URL for image preview, or null for non-renderable types. */
    previewUrl: string | null;
    /** Base64 payload, computed once on selection. */
    dataBase64: string;
}

export interface CopilotError {
    code: string;
    message: string;
    details?: Record<string, string>;
}

export interface CopilotState {
    status: CopilotStatus;
    file: SelectedFile | null;
    question: string;
    activeAction: AiAction | null;
    result: AnalysisResult | null;
    resultMeta: { model: string; durationMs: number; action: AiAction } | null;
    error: CopilotError | null;
}
