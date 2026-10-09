/**
 * Parser for raw model output.
 *
 * Strategy (never let malformed output crash the UI):
 *   1. Strip Markdown code fences.
 *   2. `JSON.parse` the result.
 *   3. If that fails, extract the first balanced JSON substring and retry.
 *   4. Validate against {@link analysisResultSchema}, coercing where safe.
 *   5. If everything fails, return a safe fallback carrying the raw text as a
 *      summary so the user still sees *something* meaningful.
 */
import { analysisResultSchema } from './schemas';
import type { AnalysisResult } from '@/types/ai';
import {
    extractJsonSubstring,
    normalizeWhitespace,
    stripCodeFences,
} from '@/lib/utilities/text';

function tryJsonParse(text: string): unknown | null {
    const stripped = stripCodeFences(text);
    try {
        return JSON.parse(stripped);
    } catch {
        const candidate = extractJsonSubstring(stripped);
        if (!candidate) return null;
        try {
            return JSON.parse(candidate);
        } catch {
            return null;
        }
    }
}

/**
 * Parse raw model text into a validated {@link AnalysisResult}.
 *
 * @param rawText - The raw text returned by the model.
 * @returns A validated result, or a fallback derived from the raw text.
 */
export function parseAnalysisResult(rawText: string): AnalysisResult {
    const trimmed = rawText?.trim() ?? '';

    if (trimmed.length === 0) {
        return buildFallback('');
    }

    const parsed = tryJsonParse(trimmed);
    if (parsed && typeof parsed === 'object') {
        const validated = analysisResultSchema.safeParse(parsed);
        if (validated.success) {
            return validated.data;
        }
        // Partial recovery: merge the raw object with defaults by re-parsing leniently.
        const loose = analysisResultSchema.safeParse(coerceShape(parsed));
        if (loose.success) {
            return { ...loose.data, notes: loose.data.notes ?? 'Some fields were coerced from an incomplete response.' };
        }
    }

    // Non-JSON response (e.g. plain prose). Surface it as the summary.
    return buildFallback(trimmed);
}

/** Best-effort coercion of an object into the schema's expected shape. */
function coerceShape(value: unknown): Record<string, unknown> {
    const source = (value ?? {}) as Record<string, unknown>;
    const asString = (v: unknown): string =>
        typeof v === 'string' ? v : v == null ? '' : String(v);
    const asStringArray = (v: unknown): string[] => {
        if (Array.isArray(v)) return v.map(asString).filter((s) => s.length > 0);
        if (typeof v === 'string' && v.trim().length > 0) return [v];
        return [];
    };
    const asQuiz = (v: unknown): Array<{ question: string; answer: string; explanation?: string }> => {
        if (!Array.isArray(v)) return [];
        return v
            .map((item) => {
                if (typeof item === 'string') return { question: item, answer: '' };
                const obj = (item ?? {}) as Record<string, unknown>;
                return {
                    question: asString(obj.question ?? obj.q),
                    answer: asString(obj.answer ?? obj.a),
                    ...(obj.explanation ? { explanation: asString(obj.explanation) } : {}),
                };
            })
            .filter((item) => item.question.length > 0);
    };

    return {
        title: asString(source.title),
        summary: asString(source.summary),
        keyPoints: asStringArray(source.keyPoints ?? source.key_points),
        explanation: asString(source.explanation),
        actions: asStringArray(source.actions),
        quiz: asQuiz(source.quiz),
        confidence: source.confidence,
        ...(source.answer != null ? { answer: asString(source.answer) } : {}),
        ...(source.notes != null ? { notes: asString(source.notes) } : {}),
    };
}

/** Construct a safe fallback result from raw text. */
export function buildFallback(rawText: string): AnalysisResult {
    const text = normalizeWhitespace(rawText);
    return {
        title: 'Unstructured Response',
        summary: text.slice(0, 1200),
        keyPoints: [],
        explanation: '',
        actions: [],
        quiz: [],
        confidence: 'low',
        notes:
            text.length === 0
                ? 'The AI returned an empty response. Please retry.'
                : 'The AI response was not in the expected structured format; showing the raw text.',
    };
}
