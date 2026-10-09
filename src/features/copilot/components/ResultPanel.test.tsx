import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultPanel } from './ResultPanel';
import { ErrorAlert } from './ErrorAlert';
import { validResult } from '@/tests/fixtures';

const meta = { model: 'gemma-test-model', durationMs: 1200, action: 'analyze' as const };

describe('ResultPanel', () => {
    it('renders the structured result fields', () => {
        render(<ResultPanel result={validResult} meta={meta} onReset={() => undefined} />);

        expect(screen.getByText('Quarterly Report')).toBeInTheDocument();
        expect(screen.getByText(/Revenue up 12%/)).toBeInTheDocument();
        expect(screen.getByText(/Review churn drivers/)).toBeInTheDocument();
        expect(screen.getByText(/Confidence: high/)).toBeInTheDocument();
    });

    it('renders the quiz question and reveals the answer', () => {
        render(<ResultPanel result={validResult} meta={meta} onReset={() => undefined} />);
        expect(screen.getByText(/How much did revenue grow\?/)).toBeInTheDocument();
    });

    it('does not render sections for absent fields', () => {
        render(
            <ResultPanel
                result={{ ...validResult, quiz: [], actions: [], answer: undefined }}
                meta={{ ...meta, action: 'summarize' }}
                onReset={() => undefined}
            />,
        );
        expect(screen.queryByText('Quiz')).not.toBeInTheDocument();
        expect(screen.queryByText('Action Plan')).not.toBeInTheDocument();
    });
});

describe('ErrorAlert', () => {
    it('renders a safe message and code', () => {
        render(<ErrorAlert error={{ code: 'AI_RATE_LIMITED', message: 'Please retry.' }} />);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Please retry.')).toBeInTheDocument();
        expect(screen.getByText('AI_RATE_LIMITED')).toBeInTheDocument();
    });

    it('renders field-level validation details', () => {
        render(
            <ErrorAlert
                error={{
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid request.',
                    details: { filename: 'required' },
                }}
            />,
        );
        expect(screen.getByText(/required/)).toBeInTheDocument();
    });
});
