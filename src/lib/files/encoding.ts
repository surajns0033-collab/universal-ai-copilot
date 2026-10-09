/**
 * Encoding helpers for moving file bytes between browser, server and the
 * AI provider's expected wire format.
 */

/** Read a browser File/Blob into a base64 string (no data-URL prefix). */
export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.onload = () => {
            const result = reader.result;
            if (typeof result !== 'string') {
                reject(new Error('Unexpected file reader result.'));
                return;
            }
            // result is a data URL: "data:<mime>;base64,<payload>"
            const commaIndex = result.indexOf(',');
            resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
        };
        reader.readAsDataURL(blob);
    });
}

/** Convert a Node Buffer to base64. */
export function bufferToBase64(buffer: ArrayBuffer): string {
    return Buffer.from(buffer).toString('base64');
}

/**
 * Extract the base64 payload from a possibly data-URL-prefixed string and
 * return it together with the declared MIME type (if present).
 */
export function splitDataUrl(input: string): { base64: string; mimeType?: string } {
    const match = /^data:([^;,]+)?;base64,(.*)$/s.exec(input);
    if (match) {
        return { mimeType: match[1], base64: match[2] ?? '' };
    }
    return { base64: input };
}

/** Rough decoded-size estimate for a base64 string (bytes). */
export function base64ByteLength(base64: string): number {
    const clean = base64.replace(/=+$/, '').replace(/\s/g, '');
    return Math.floor((clean.length * 3) / 4);
}
