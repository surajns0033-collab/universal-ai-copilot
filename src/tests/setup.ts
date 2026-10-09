import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Ensure a clean DOM between tests when a UI test runs.
afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});
