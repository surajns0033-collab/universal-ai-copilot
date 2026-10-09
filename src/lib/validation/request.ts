/**
 * Runtime validation of the analyze request payload.
 *
 * Defence in depth: even though the client validates before sending, the server
 * re-validates everything and enforces the authoritative size limit.
 */
import { z } from 'zod';
import { AI_ACTIONS } from '@/types/ai';
import { ACCEPTED_MIME_TYPES } from '@/config/constants';

const acceptedMimes = Object.keys(ACCEPTED_MIME_TYPES) as [string, ...string[]];

export const analyzeRequestSchema = z
    .object({
        // Use the tuple directly so the parsed type stays the `AiAction` union
        // (casting to a widened string[] would erase the union).
        action: z.enum(AI_ACTIONS),
        filename: z.string().min(1).max(300),
        mimeType: z.enum(acceptedMimes),
        sizeBytes: z.number().int().nonnegative(),
        // Base64 without the data-URL prefix. Empty base64 is rejected so we never
        // send a blank part to the model.
        dataBase64: z.string().min(1),
        question: z.string().max(2000).optional(),
    })
    .superRefine((value, ctx) => {
        if (value.action === 'ask' && (!value.question || value.question.trim().length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['question'],
                message: 'A question is required for the Ask AI action.',
            });
        }
    });

export type AnalyzeRequestSchema = z.infer<typeof analyzeRequestSchema>;
