'use client';

import { Badge } from '@/components/ui/Badge';
import { Card, CardBody } from '@/components/ui/Card';
import { getActionDescriptor } from '@/config/constants';
import { cn } from '@/lib/utilities/cn';
import type { AnalysisResult, Confidence } from '@/types/ai';
import type { AiAction } from '@/types/api';
import { CopyButton } from './CopyButton';

export interface ResultPanelProps {
    result: AnalysisResult;
    meta: { model: string; durationMs: number; action: AiAction };
    onReset: () => void;
}

const confidenceTone: Record<Confidence, 'success' | 'warning' | 'danger'> = {
    high: 'success',
    medium: 'warning',
    low: 'danger',
};

/**
 * Renders the structured AI result.
 *
 * All model output is rendered as plain text within React (never via
 * dangerouslySetInnerHTML), which neutralises any HTML/script injection in the
 * generated content.
 */
export function ResultPanel({ result, meta }: ResultPanelProps) {
    const actionLabel = getActionDescriptor(meta.action)?.label ?? meta.action;

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-slate-900">{result.title}</h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                        {actionLabel} · {meta.model} · {(meta.durationMs / 1000).toFixed(1)}s
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge tone={confidenceTone[result.confidence]}>Confidence: {result.confidence}</Badge>
                    <CopyButton text={toPlainText(result)} label="Copy result" />
                </div>
            </div>

            {result.notes && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {result.notes}
                </div>
            )}

            {result.answer && (
                <Section title="Answer">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{result.answer}</p>
                </Section>
            )}

            {result.summary && (
                <Section title="Summary">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{result.summary}</p>
                </Section>
            )}

            {result.explanation && (
                <Section title="Explanation">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{result.explanation}</p>
                </Section>
            )}

            {result.keyPoints.length > 0 && (
                <Section title="Key Points">
                    <ul className="space-y-1.5">
                        {result.keyPoints.map((point, index) => (
                            <li key={index} className="flex gap-2 text-sm text-slate-700">
                                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {result.actions.length > 0 && (
                <Section title="Action Plan">
                    <ol className="space-y-2">
                        {result.actions.map((action, index) => (
                            <li key={index} className="flex gap-3 text-sm text-slate-700">
                                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                                    {index + 1}
                                </span>
                                <span>{action}</span>
                            </li>
                        ))}
                    </ol>
                </Section>
            )}

            {result.quiz.length > 0 && (
                <Section title="Quiz">
                    <div className="space-y-3">
                        {result.quiz.map((item, index) => (
                            <QuizCard key={index} index={index} item={item} />
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h3>
            {children}
        </section>
    );
}

function QuizCard({ index, item }: { index: number; item: AnalysisResult['quiz'][number] }) {
    return (
        <Card className="bg-slate-50/60 shadow-none">
            <CardBody className="py-3">
                <p className="text-sm font-medium text-slate-900">
                    {index + 1}. {item.question}
                </p>
                <details className="group mt-2">
                    <summary className="cursor-pointer list-none text-xs font-medium text-brand-700 hover:underline">
                        Show answer
                    </summary>
                    <div className="mt-2 space-y-1">
                        <p className={cn('text-sm text-slate-700')}>{item.answer}</p>
                        {item.explanation && <p className="text-xs text-slate-500">{item.explanation}</p>}
                    </div>
                </details>
            </CardBody>
        </Card>
    );
}

/** Flatten a result into copyable plain text. */
function toPlainText(result: AnalysisResult): string {
    const lines: string[] = [];
    lines.push(result.title);
    if (result.answer) lines.push('', 'ANSWER', result.answer);
    if (result.summary) lines.push('', 'SUMMARY', result.summary);
    if (result.explanation) lines.push('', 'EXPLANATION', result.explanation);
    if (result.keyPoints.length) {
        lines.push('', 'KEY POINTS');
        result.keyPoints.forEach((p) => lines.push(`- ${p}`));
    }
    if (result.actions.length) {
        lines.push('', 'ACTION PLAN');
        result.actions.forEach((a, i) => lines.push(`${i + 1}. ${a}`));
    }
    if (result.quiz.length) {
        lines.push('', 'QUIZ');
        result.quiz.forEach((q, i) => lines.push(`${i + 1}. ${q.question}`, `   ${q.answer}`));
    }
    if (result.notes) lines.push('', `NOTE: ${result.notes}`);
    return lines.join('\n');
}
