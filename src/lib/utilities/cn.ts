/**
 * Minimal className combiner. Filters falsy values and joins with spaces.
 * Avoids a dependency on clsx/tailwind-merge for a small surface area, while
 * keeping component call sites readable.
 */
export type ClassValue = string | number | false | null | undefined | ClassValue[];

export function cn(...values: ClassValue[]): string {
    const out: string[] = [];
    const walk = (value: ClassValue): void => {
        if (!value) return;
        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }
        out.push(String(value));
    };
    values.forEach(walk);
    return out.join(' ');
}
