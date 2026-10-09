'use client';

/**
 * useCopilot — the feature's single orchestration hook.
 *
 * Owns the whole client workflow (select → validate → preview → run action →
 * render result) in a `useReducer`, keeping state transitions explicit and
 * components free of business logic. Components consume this hook; they never
 * call the API or encode AI rules themselves.
 */
import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { AiAction, SourceDescriptor } from '@/types/ai';
import { validateFile, describeSource } from '@/lib/files/validation';
import { blobToBase64 } from '@/lib/files/encoding';
import { DEFAULT_MAX_UPLOAD_MB } from '@/config/constants';
import { ClientError, runAction } from '@/services/api-client';
import type { CopilotError, CopilotState, SelectedFile } from './types';

type Action =
    | { type: 'SELECT_FILE'; payload: SelectedFile }
    | { type: 'CLEAR_FILE' }
    | { type: 'SET_QUESTION'; payload: string }
    | { type: 'RUN_START'; payload: AiAction }
    | { type: 'RUN_SUCCESS'; payload: CopilotState['result'] & object; meta: NonNullable<CopilotState['resultMeta']> }
    | { type: 'RUN_ERROR'; payload: CopilotError }
    | { type: 'RESET_RESULT' };

const initialState: CopilotState = {
    status: 'idle',
    file: null,
    question: '',
    activeAction: null,
    result: null,
    resultMeta: null,
    error: null,
};

function reducer(state: CopilotState, action: Action): CopilotState {
    switch (action.type) {
        case 'SELECT_FILE':
            return { ...initialState, status: 'ready', file: action.payload };
        case 'CLEAR_FILE':
            return { ...initialState };
        case 'SET_QUESTION':
            return { ...state, question: action.payload };
        case 'RUN_START':
            return { ...state, status: 'loading', activeAction: action.payload, error: null };
        case 'RUN_SUCCESS':
            return {
                ...state,
                status: 'success',
                result: action.payload,
                resultMeta: action.meta,
                error: null,
            };
        case 'RUN_ERROR':
            return { ...state, status: 'error', error: action.payload, result: null, resultMeta: null };
        case 'RESET_RESULT':
            return { ...state, result: null, resultMeta: null, error: null, status: state.file ? 'ready' : 'idle' };
        default:
            return state;
    }
}

export interface UseCopilotOptions {
    /** Maximum upload size in MB. Defaults to the shared constant. */
    maxUploadMb?: number;
}

export interface UseCopilotApi extends CopilotState {
    selectFile: (file: File) => Promise<void>;
    clearFile: () => void;
    setQuestion: (value: string) => void;
    run: (action: AiAction) => Promise<void>;
    resetResult: () => void;
    isBusy: boolean;
    canRun: boolean;
}

export function useCopilot(options: UseCopilotOptions = {}): UseCopilotApi {
    const [state, dispatch] = useReducer(reducer, initialState);
    const maxBytes = (options.maxUploadMb ?? DEFAULT_MAX_UPLOAD_MB) * 1024 * 1024;
    const previewUrlRef = useRef<string | null>(null);

    // Revoke preview URLs when they change or on unmount to avoid memory leaks.
    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }
        };
    }, []);

    const selectFile = useCallback(
        async (file: File): Promise<void> => {
            try {
                const input = {
                    filename: file.name,
                    mimeType: file.type || guessMimeFromName(file.name),
                    sizeBytes: file.size,
                };
                validateFile(input, maxBytes);
                const source: SourceDescriptor = describeSource(input);
                const dataBase64 = await blobToBase64(file);

                if (previewUrlRef.current) {
                    URL.revokeObjectURL(previewUrlRef.current);
                    previewUrlRef.current = null;
                }
                const previewUrl =
                    source.kind === 'image' ? URL.createObjectURL(file) : null;
                previewUrlRef.current = previewUrl;

                dispatch({
                    type: 'SELECT_FILE',
                    payload: { file, source, previewUrl, dataBase64 },
                });
            } catch (err) {
                const clientError = toClientError(err);
                dispatch({ type: 'RUN_ERROR', payload: clientError });
            }
        },
        [maxBytes],
    );

    const clearFile = useCallback(() => {
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
            previewUrlRef.current = null;
        }
        dispatch({ type: 'CLEAR_FILE' });
    }, []);

    const setQuestion = useCallback((value: string) => {
        dispatch({ type: 'SET_QUESTION', payload: value });
    }, []);

    const resetResult = useCallback(() => {
        dispatch({ type: 'RESET_RESULT' });
    }, []);

    const run = useCallback(
        async (action: AiAction): Promise<void> => {
            if (!state.file) {
                dispatch({
                    type: 'RUN_ERROR',
                    payload: { code: 'VALIDATION_ERROR', message: 'Select a file first.' },
                });
                return;
            }
            if (action === 'ask' && state.question.trim().length === 0) {
                dispatch({
                    type: 'RUN_ERROR',
                    payload: { code: 'VALIDATION_ERROR', message: 'Enter a question to ask.' },
                });
                return;
            }

            dispatch({ type: 'RUN_START', payload: action });
            try {
                const outcome = await runAction({
                    action,
                    source: state.file.source,
                    dataBase64: state.file.dataBase64,
                    ...(action === 'ask' ? { question: state.question.trim() } : {}),
                });
                dispatch({
                    type: 'RUN_SUCCESS',
                    payload: outcome.result,
                    meta: { model: outcome.model, durationMs: outcome.durationMs, action },
                });
            } catch (err) {
                dispatch({ type: 'RUN_ERROR', payload: toClientError(err) });
            }
        },
        [state.file, state.question],
    );

    const isBusy = state.status === 'loading';
    const canRun =
        state.status === 'ready' || (state.status === 'success' && !isBusy) || (state.status === 'error' && !!state.file);

    return {
        ...state,
        selectFile,
        clearFile,
        setQuestion,
        run,
        resetResult,
        isBusy,
        canRun,
    };
}

/** Map any thrown value into a user-safe error object. */
function toClientError(err: unknown): CopilotError {
    if (err instanceof ClientError) {
        return { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) };
    }
    if (err instanceof Error) {
        return { code: 'SERVER_ERROR', message: err.message };
    }
    return { code: 'SERVER_ERROR', message: 'Something went wrong.' };
}

/** Best-effort MIME guess when the browser supplies an empty type. */
function guessMimeFromName(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    switch (ext) {
        case 'pdf':
            return 'application/pdf';
        case 'png':
            return 'image/png';
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'txt':
            return 'text/plain';
        default:
            return 'application/octet-stream';
    }
}
