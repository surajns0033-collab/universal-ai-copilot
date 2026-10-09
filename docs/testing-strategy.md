# Testing Strategy — Universal AI Copilot

## 1. Principles

- **No live API calls.** Every test runs against a **mocked** AI provider. No API key is required and no network requests are made.
- **Test behaviour, not implementation.** Assertions target observable outcomes (returned values, thrown error types/codes, rendered text).
- **Deterministic.** Time-dependent behaviour is controlled (custom timeouts, controllable promises) so tests never flake.
- **Fast feedback.** Vitest in a jsdom environment with a single setup file.

## 2. Tooling

- **Vitest** — runner, assertions, mocking, coverage (v8).
- **@testing-library/react** — component testing.
- **jsdom** — DOM environment.
- Config in [`vitest.config.ts`](../vitest.config.ts); setup in [`src/tests/setup.ts`](../src/tests/setup.ts) (jest-dom matchers; `cleanup` + `restoreAllMocks` after each test).

## 3. Commands

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

## 4. Test layers

### Unit tests

| Area | File | What is covered |
| --- | --- | --- |
| File validation | [`src/lib/files/validation.test.ts`](../src/lib/files/validation.test.ts) | Extension, MIME, size, empty files, filename sanitisation, byte formatting. |
| Encoding | [`src/lib/files/encoding.test.ts`](../src/lib/files/encoding.test.ts) | `File` → base64, data-URL handling, byte length. |
| Text utilities | [`src/lib/utilities/text.test.ts`](../src/lib/utilities/text.test.ts) | Truncation, whitespace normalisation, code-fence stripping, JSON extraction. |
| Class names | [`src/lib/utilities/cn.test.ts`](../src/lib/utilities/cn.test.ts) | Conditional class composition. |
| Prompts | [`src/lib/ai/prompts/prompts.test.ts`](../src/lib/ai/prompts/prompts.test.ts) | Grounding rules present; action-specific guidance; question injection. |
| Output parsing | [`src/lib/ai/parser.test.ts`](../src/lib/ai/parser.test.ts) | Valid JSON, fenced JSON, prose-wrapped JSON, partial JSON, fallback path. |
| Environment | [`src/config/env.test.ts`](../src/config/env.test.ts) | Defaults, overrides, missing/invalid variables, Gemma 4 default. |
| Request schema | [`src/lib/validation/request.test.ts`](../src/lib/validation/request.test.ts) | Valid payloads; `ask` requires a question; boundary sizes. |
| Provider client | [`src/lib/ai/gemma-client.test.ts`](../src/lib/ai/gemma-client.test.ts) | Inline-data forwarding; configured model; timeout → `AI_TIMEOUT`; error mapping. |
| AI service | [`src/lib/ai/service.test.ts`](../src/lib/ai/service.test.ts) | Model name propagation; empty output → `AiOutputError`; rate-limit surfacing. |
| Application service | [`src/services/analyze-service.test.ts`](../src/services/analyze-service.test.ts) | End-to-end orchestration with a fake client; validation failures. |

### UI tests

| Area | File | What is covered |
| --- | --- | --- |
| Result rendering | [`src/features/copilot/components/ResultPanel.test.tsx`](../src/features/copilot/components/ResultPanel.test.tsx) | Title/summary/key points render; confidence badge; text-only rendering (no HTML injection). |

## 5. Fakes and fixtures

Centralised in [`src/tests/fixtures.ts`](../src/tests/fixtures.ts):

- `validResult`, `validJsonText`, `fencedJsonText`, `proseWrappedJsonText`, `proseText`, `partialJsonText` — deterministic model-output samples.
- `createFakeGenAiClient(text)` — a `GenAiClientLike` returning a fixed payload, capturing the request for assertions.
- `createRateLimitedClient()` — a client that throws a 429-style error.
- `testServerConfig` — a `ServerConfig` with an overridable model and timeout.

## 6. What "done" means for a change

- New behaviour has a test that fails without it.
- Failure paths (invalid input, provider error, malformed output) are covered.
- The full suite passes with zero failures.
- Coverage does not regress.

## 7. Coverage focus

Priority coverage targets: file/request validation, prompt composition, output parsing and recovery, provider error mapping, and the application service. These are the areas where correctness and safety matter most.

## 8. Non-goals

- Live end-to-end tests against the Gemini API (avoided to keep the suite hermetic).
- Visual regression / snapshot-heavy testing.
- Load or performance testing.
