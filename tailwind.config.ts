import type { Config } from 'tailwindcss';

/**
 * Design tokens for Universal AI Copilot.
 *
 * A restrained, premium palette: a single accent hue (indigo) with neutral
 * slate greys. Semantic colors only for state feedback. This keeps the visual
 * language consistent and accessible rather than decorative.
 */
const config: Config = {
    content: [
        './src/app/**/*.{ts,tsx}',
        './src/components/**/*.{ts,tsx}',
        './src/features/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
            },
            fontFamily: {
                sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
            },
            boxShadow: {
                card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
                'card-hover':
                    '0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 6px -2px rgb(15 23 42 / 0.06)',
            },
            keyframes: {
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(4px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                shimmer: {
                    '100%': { transform: 'translateX(100%)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 200ms ease-out',
                shimmer: 'shimmer 1.6s infinite',
            },
        },
    },
    plugins: [],
};

export default config;
