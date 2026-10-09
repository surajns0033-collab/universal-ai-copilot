/**
 * Text helpers used by the parser and UI.
 */

/** Truncate a string to a maximum length, appending an ellipsis when cut. */
export function truncate(value: string, max: number): string {
    if (value.length <= max) return value;
    return `${value.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/** Collapse internal whitespace and trim. */
export function normalizeWhitespace(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
}

/**
 * Strip a leading/trailing Markdown code fence from a model response.
 * Models frequently wrap JSON in ```json ... ``` blocks.
 */
export function stripCodeFences(value: string): string {
    const trimmed = value.trim();
    const fence = /^```[a-zA-Z0-9_-]*\n?([\s\S]*?)\n?```$/;
    const match = fence.exec(trimmed);
    if (match) return (match[1] ?? '').trim();
    return trimmed;
}

/**
 * Extract the first balanced JSON object/array substring from arbitrary text.
 * Used as a recovery strategy when a model returns prose around its JSON.
 * Returns null when no balanced structure is found.
 */
export function extractJsonSubstring(value: string): string | null {
    const start = value.search(/[[{]/);
    if (start < 0) return null;

    const open = value[start];
    const close = open === '{' ? '}' : ']';
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let i = start; i < value.length; i += 1) {
        const char = value[i];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
        } else if (char === open) {
            depth += 1;
        } else if (char === close) {
            depth -= 1;
            if (depth === 0) {
                return value.slice(start, i + 1);
            }
        }
    }

    return null;
}
