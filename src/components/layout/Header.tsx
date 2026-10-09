import { SparklesIcon } from '@/components/ui/Icons';

/**
 * Product header. Communicates identity and the core value proposition without
 * promotional noise.
 */
export function Header() {
    return (
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                        <SparklesIcon className="h-5 w-5" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold leading-tight text-slate-900">
                            Universal AI Copilot
                        </p>
                        <p className="text-xs leading-tight text-slate-500">
                            Upload anything. Understand it. Act on it.
                        </p>
                    </div>
                </div>

                <div className="hidden items-center gap-2 sm:flex">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        Gemma 4 · Gemini API
                    </span>
                    <a
                        href="https://ai.google.dev/gemma/docs"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-xs font-medium text-brand-700 underline-offset-4 hover:underline"
                    >
                        Docs
                    </a>
                </div>
            </div>
        </header>
    );
}
