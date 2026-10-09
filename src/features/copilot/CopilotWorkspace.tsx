'use client';

import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ScanIcon, SparklesIcon } from '@/components/ui/Icons';
import { useCopilot } from './useCopilot';
import { UploadZone } from './components/UploadZone';
import { FilePreview } from './components/FilePreview';
import { ActionBar } from './components/ActionBar';
import { QuestionInput } from './components/QuestionInput';
import { ErrorAlert } from './components/ErrorAlert';
import { ResultPanel } from './components/ResultPanel';
import { ResultsSkeleton } from './components/ResultsSkeleton';

/**
 * The application's primary workspace.
 *
 * Composition root for the copilot feature: it wires the {@link useCopilot}
 * hook to presentational components. It contains no AI or validation logic of
 * its own — every decision lives in the hook, service, or AI layer.
 */
export function CopilotWorkspace() {
    const copilot = useCopilot();

    const handleRun = (action: Parameters<typeof copilot.run>[0]) => {
        void copilot.run(action);
    };

    return (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-5 lg:py-8">
            {/* Left column: source input */}
            <div className="space-y-5 lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>1 · Provide your source</CardTitle>
                        {copilot.file && (
                            <Button variant="ghost" size="sm" onClick={copilot.clearFile} disabled={copilot.isBusy}>
                                Clear
                            </Button>
                        )}
                    </CardHeader>
                    <CardBody>
                        {copilot.file ? (
                            <FilePreview
                                selected={copilot.file}
                                onRemove={copilot.clearFile}
                                disabled={copilot.isBusy}
                            />
                        ) : (
                            <UploadZone onSelect={(file) => void copilot.selectFile(file)} disabled={copilot.isBusy} />
                        )}
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>2 · Choose an action</CardTitle>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        <ActionBar
                            onRun={handleRun}
                            activeAction={copilot.activeAction}
                            disabled={!copilot.file || copilot.isBusy}
                        />
                        <QuestionInput
                            value={copilot.question}
                            onChange={copilot.setQuestion}
                            onAsk={() => void copilot.run('ask')}
                            disabled={!copilot.file || copilot.isBusy}
                        />
                    </CardBody>
                </Card>
            </div>

            {/* Right column: results */}
            <div className="lg:col-span-3">
                <Card className="min-h-[420px]">
                    <CardHeader>
                        <CardTitle>3 · Structured understanding</CardTitle>
                        {copilot.resultMeta && copilot.status !== 'loading' && (
                            <Button variant="ghost" size="sm" onClick={copilot.resetResult}>
                                New
                            </Button>
                        )}
                    </CardHeader>
                    <CardBody>
                        {copilot.isBusy && <ResultsSkeleton />}

                        {!copilot.isBusy && copilot.error && (
                            <ErrorAlert
                                error={copilot.error}
                                onRetry={
                                    copilot.activeAction && copilot.file
                                        ? () => void copilot.run(copilot.activeAction!)
                                        : undefined
                                }
                                onDismiss={copilot.resetResult}
                            />
                        )}

                        {!copilot.isBusy && !copilot.error && copilot.result && copilot.resultMeta && (
                            <ResultPanel
                                result={copilot.result}
                                meta={copilot.resultMeta}
                                onReset={copilot.resetResult}
                            />
                        )}

                        {!copilot.isBusy && !copilot.error && !copilot.result && (
                            <EmptyState
                                icon={copilot.file ? <ScanIcon className="h-6 w-6" /> : <SparklesIcon className="h-6 w-6" />}
                                title={copilot.file ? 'Ready to analyze' : 'No source yet'}
                                description={
                                    copilot.file
                                        ? `Select an action to understand "${copilot.file.source.filename}".`
                                        : 'Upload a PDF, image, or text file to begin. Your content is analysed server-side.'
                                }
                            />
                        )}
                    </CardBody>
                </Card>

                {copilot.file && !copilot.result && !copilot.error && (
                    <p className="mt-3 px-1 text-xs text-slate-500">
                        Selected:{' '}
                        <span className="font-medium text-slate-700">{copilot.file.source.filename}</span>
                        {' · '}
                        {copilot.isBusy ? 'AI is processing…' : 'Choose an action above to continue.'}
                    </p>
                )}
            </div>
        </div>
    );
}
