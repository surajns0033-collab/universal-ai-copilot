import { describe, expect, it } from 'vitest';
import { buildFallback, parseAnalysisResult } from './parser';
import {
    fencedJsonText,
    partialJsonText,
    proseText,
    proseWrappedJsonText,
    validJsonText,
    validResult,
} from '@/tests/fixtures';

describe('parseAnalysisResult', () => {
    it('parses clean JSON', () => {
        const result = parseAnalysisResult(validJsonText);
        expect(result.title).toBe(validResult.title);
        expect(result.keyPoints).toEqual(validResult.keyPoints);
        expect(result.confidence).toBe('high');
    });

    it('parses fenced JSON', () => {
        const result = parseAnalysisResult(fencedJsonText);
        expect(result.title).toBe(validResult.title);
    });

    it('parses JSON embedded in prose', () => {
        const result = parseAnalysisResult(proseWrappedJsonText);
        expect(result.title).toBe(validResult.title);
        expect(result.quiz).toHaveLength(1);
    });

    it('coerces a partial object with defaults', () => {
        const result = parseAnalysisResult(partialJsonText);
        expect(result.title).toBe('Sparse');
        expect(result.keyPoints).toEqual([]);
        expect(result.actions).toEqual([]);
        expect(result.confidence).toBe('low');
    });

    it('coerces a string where an array is expected', () => {
        const result = parseAnalysisResult(JSON.stringify({ title: 'T', keyPoints: 'only one' }));
        expect(result.keyPoints).toEqual(['only one']);
    });

    it('falls back to prose when JSON is not present', () => {
        const result = parseAnalysisResult(proseText);
        expect(result.confidence).toBe('low');
        expect(result.summary).toContain('quarterly revenue');
        expect(result.notes).toMatch(/not in the expected structured format/i);
    });

    it('handles empty input without throwing', () => {
        const result = parseAnalysisResult('');
        expect(result.confidence).toBe('low');
        expect(result.notes).toMatch(/empty response/i);
    });

    it('buildFallback exposes a safe default shape', () => {
        const fallback = buildFallback('some text');
        expect(fallback.title).toBe('Unstructured Response');
        expect(fallback.quiz).toEqual([]);
    });
});
