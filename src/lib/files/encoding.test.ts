import { describe, expect, it } from 'vitest';
import { base64ByteLength, bufferToBase64, splitDataUrl } from './encoding';

describe('splitDataUrl', () => {
    it('splits a data URL into mime + payload', () => {
        expect(splitDataUrl('data:image/png;base64,AAAA')).toEqual({
            mimeType: 'image/png',
            base64: 'AAAA',
        });
    });

    it('returns raw input as base64 when there is no prefix', () => {
        expect(splitDataUrl('AAAA')).toEqual({ base64: 'AAAA' });
    });
});

describe('bufferToBase64', () => {
    it('converts an ArrayBuffer to base64', () => {
        const buffer = new Uint8Array([65, 66, 67]).buffer; // "ABC"
        expect(bufferToBase64(buffer)).toBe('QUJD');
    });
});

describe('base64ByteLength', () => {
    it('estimates decoded length', () => {
        // "QUJD" -> "ABC" (3 bytes)
        expect(base64ByteLength('QUJD')).toBe(3);
    });

    it('ignores padding and whitespace', () => {
        expect(base64ByteLength('QUJD\n')).toBe(3);
    });
});
