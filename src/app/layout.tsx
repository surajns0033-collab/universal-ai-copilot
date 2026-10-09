import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Universal AI Copilot — Upload anything. Understand it. Act on it.',
    description:
        'A multimodal AI copilot that turns unstructured documents and images into structured insights and actionable outputs, powered by Gemma 4 through the Gemini API.',
    applicationName: 'Universal AI Copilot',
    keywords: ['AI', 'Gemma 4', 'Gemma', 'Gemini', 'multimodal', 'document understanding', 'open source'],
    authors: [{ name: 'Universal AI Copilot contributors' }],
    openGraph: {
        title: 'Universal AI Copilot',
        description: 'Upload anything. Understand it. Turn knowledge into action.',
        type: 'website',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#4f46e5',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <a
                    href="#workspace"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
                >
                    Skip to content
                </a>
                {children}
            </body>
        </html>
    );
}
