import { describe, expect, it } from 'vitest';
import {
    extractJsonSubstring,
    normalizeWhitespace,
    stripCodeFences,
    truncate,
} from './text';

describe('truncate', () => {
    it('leaves short strings unchanged', () => {
        expect(truncate('hello', 10)).toBe('hello');
    });

    it('appends an ellipsis when cut', () => {
        expect(truncate('hello world', 8)).toBe('hello w…');
    });
});

describe('normalizeWhitespace', () => {
    it('collapses and trims', () => {
        expect(normalizeWhitespace('  a   b \n c ')).toBe('a b c');
    });
});

describe('stripCodeFences', () => {
    it('removes a json fence', () => {
        expect(stripCodeFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
    });

    it('removes an untyped fence', () => {
        expect(stripCodeFences('```\n{"a":1}\n```')).toBe('{"a":1}');
    });

    it('leaves plain text unchanged', () => {
        expect(stripCodeFences('{"a":1}')).toBe('{"a":1}');
    });
});

describe('extractJsonSubstring', () => {
    it('extracts a balanced object from prose', () => {
        expect(extractJsonSubstring('text {"a":{"b":1}} tail')).toBe('{"a":{"b":1}}');
    });

    it('handles braces inside strings', () => {
        expect(extractJsonSubstring('x {"a":"}{"} y')).toBe('{"a":"}{"}');
    });

    it('returns null when no JSON is present', () => {
        expect(extractJsonSubstring('no json here')).toBeNull();
    });
});
