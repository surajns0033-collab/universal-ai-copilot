import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CopilotWorkspace } from '@/features/copilot/CopilotWorkspace';
import { Badge } from '@/components/ui/Badge';
import { BookIcon, HelpIcon, QuizIcon, ScanIcon, SparklesIcon, ChecklistIcon } from '@/components/ui/Icons';

/**
 * Landing page.
 *
 * Kept as a server component (fast first paint, no client JS for the static
 * shell). The interactive workspace is a client component island.
 */
export default function HomePage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Header />

            <main id="workspace" className="flex-1">
                <Hero />
                <CopilotWorkspace />
                <HowItWorks />
            </main>

            <Footer />
        </div>
    );
}

function Hero() {
    return (
        <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
                <div className="max-w-3xl">
                    <Badge tone="brand">Multimodal · Gemma 4 · Gemini API</Badge>
                    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                        Upload anything. Understand it. Turn knowledge into action.
                    </h1>
                    <p className="mt-4 text-base leading-relaxed text-slate-600">
                        Universal AI Copilot converts unstructured documents, images, and text into structured
                        insight — summaries, explanations, answers, quizzes, and action plans — grounded strictly
                        in the content you provide.
                    </p>
                </div>
            </div>
        </section>
    );
}

const STEPS = [
    {
        icon: <ScanIcon className="h-5 w-5" />,
        title: 'Multimodal understanding',
        body: 'Images and PDFs are read directly by Gemma 4, not routed through a fragile OCR pipeline.',
    },
    {
        icon: <SparklesIcon className="h-5 w-5" />,
        title: 'Grounded reasoning',
        body: 'Every response is constrained to the source. Insufficient evidence is stated, not invented.',
    },
    {
        icon: <ChecklistIcon className="h-5 w-5" />,
        title: 'Structured output',
        body: 'Responses are validated against a strict schema, with recovery and safe fallbacks.',
    },
];

const CAPABILITIES = [
    { icon: <ScanIcon className="h-4 w-4" />, label: 'Analyze' },
    { icon: <SparklesIcon className="h-4 w-4" />, label: 'Summarize' },
    { icon: <BookIcon className="h-4 w-4" />, label: 'Explain' },
    { icon: <HelpIcon className="h-4 w-4" />, label: 'Ask AI' },
    { icon: <QuizIcon className="h-4 w-4" />, label: 'Quiz' },
    { icon: <ChecklistIcon className="h-4 w-4" />, label: 'Action Plan' },
];

function HowItWorks() {
    return (
        <section className="border-t border-slate-200 bg-white">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    How it works
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {STEPS.map((step, index) => (
                        <div key={step.title}>
                            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                                {step.icon}
                            </div>
                            <h3 className="text-sm font-semibold text-slate-900">
                                {index + 1}. {step.title}
                            </h3>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Capabilities:</span>
                    {CAPABILITIES.map((cap) => (
                        <span
                            key={cap.label}
                            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                            {cap.icon}
                            {cap.label}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
