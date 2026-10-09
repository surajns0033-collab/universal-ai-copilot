import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
    it('joins truthy string values', () => {
        expect(cn('a', 'b')).toBe('a b');
    });

    it('filters falsy values', () => {
        expect(cn('a', false, null, undefined, 'b')).toBe('a b');
    });

    it('flattens arrays', () => {
        expect(cn(['a', ['b', false]], 'c')).toBe('a b c');
    });

    it('returns an empty string when nothing is provided', () => {
        expect(cn()).toBe('');
    });
});
