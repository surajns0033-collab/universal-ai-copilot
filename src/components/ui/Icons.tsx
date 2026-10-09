/**
 * Inline SVG icon set.
 *
 * Kept dependency-free (no icon library) to minimise bundle size and keep the
 * visual language consistent. Every icon is decorative by default and marked
 * aria-hidden; accessible names come from surrounding text or a `title`.
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
};

export function ScanIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M4 7V5a1 1 0 0 1 1-1h2" />
            <path d="M17 4h2a1 1 0 0 1 1 1v2" />
            <path d="M20 17v2a1 1 0 0 1-1 1h-2" />
            <path d="M7 20H5a1 1 0 0 1-1-1v-2" />
            <path d="M4 12h16" />
        </svg>
    );
}

export function SparklesIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" />
            <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" />
        </svg>
    );
}

export function BookIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M4 5a2 2 0 0 1 2-2h11v16H6a2 2 0 0 0-2 2V5z" />
            <path d="M8 7h6" />
            <path d="M8 11h6" />
        </svg>
    );
}

export function HelpIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8v.5" />
            <path d="M12 17h.01" />
        </svg>
    );
}

export function QuizIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
            <path d="M8 17h3" />
        </svg>
    );
}

export function ChecklistIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M4 6l1.5 1.5L8 5" />
            <path d="M4 13l1.5 1.5L8 12" />
            <path d="M11 6h9" />
            <path d="M11 13h9" />
            <path d="M11 19h9" />
            <path d="M4 19h3" />
        </svg>
    );
}

export function UploadIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M12 16V4" />
            <path d="M8 8l4-4 4 4" />
            <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
    );
}

export function FileIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M14 3v5h5" />
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5z" />
        </svg>
    );
}

export function ImageIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9.5" r="1.5" />
            <path d="M21 15l-5-5L5 20" />
        </svg>
    );
}

export function CloseIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
        </svg>
    );
}

export function AlertIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    );
}

export function CheckIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );
}

export function CopyIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
    );
}

export function RefreshIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M21 12a9 9 0 1 1-2.6-6.4" />
            <path d="M21 4v5h-5" />
        </svg>
    );
}

export function ChevronDownIcon(props: IconProps) {
    return (
        <svg {...base} {...props}>
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

/** Map of icon keys used by the action catalogue to their components. */
export const ACTION_ICONS = {
    scan: ScanIcon,
    sparkles: SparklesIcon,
    book: BookIcon,
    help: HelpIcon,
    quiz: QuizIcon,
    checklist: ChecklistIcon,
} as const;

export type ActionIconName = keyof typeof ACTION_ICONS;
