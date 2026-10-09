/**
 * Runtime schemas describing the structured AI output.
 *
 * The model is *asked* to return this shape (see prompts.ts), but we never
 * trust it. {@link analysisResultSchema} is the gate every provider response
 * must pass before it reaches the application or UI.
 */
import { z } from 'zod';

export const quizItemSchema = z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
    explanation: z.string().optional(),
});

export const confidenceSchema = z.enum(['high', 'medium', 'low']);

/**
 * Lenient coercion rules:
 * - Missing string fields default to '' / safe text so a partial answer still
 *   renders instead of crashing.
 * - Array fields accept a single string and coerce to a one-element array,
 *   because models sometimes return a bare string for list fields.
 */
const stringListSchema = z
    .union([z.array(z.string()), z.string()])
    .transform((value) => (typeof value === 'string' ? (value ? [value] : []) : value));

export const analysisResultSchema = z.object({
    title: z.string().optional().default('Untitled'),
    summary: z.string().optional().default(''),
    keyPoints: stringListSchema.optional().default([]),
    explanation: z.string().optional().default(''),
    actions: stringListSchema.optional().default([]),
    quiz: z.array(quizItemSchema).optional().default([]),
    confidence: confidenceSchema.optional().default('medium'),
    answer: z.string().optional(),
    notes: z.string().optional(),
});

export type ParsedAnalysisResult = z.infer<typeof analysisResultSchema>;
