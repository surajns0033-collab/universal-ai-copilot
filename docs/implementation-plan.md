# Implementation Plan — Universal AI Copilot

This plan records the phases used to build the project, with completion status. It reflects work that was **actually implemented** in the repository.

## Phase 1 — Repository assessment & environment analysis ✅

- Confirmed an empty workspace (greenfield build).
- Established the target runtime: Next.js + React 18 + TypeScript, Node runtime for the API route.
- Later hardened the dependency set (Next.js 15.5.27, `@google/genai` 2.x, patched PostCSS) during Phase 11 quality gates.
- Identified the AI requirement: Gemma 4 as the core model, invoked through the Gemini API via `@google/genai`.

## Phase 2 — Project scaffold & configuration ✅

- [`package.json`](../package.json): scripts for `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:watch`, `test:coverage`, `format`.
- [`tsconfig.json`](../tsconfig.json): strict TypeScript, `noUncheckedIndexedAccess`, `@/*` path alias.
- [`next.config.mjs`](../next.config.mjs): React strict mode, security headers.
- [`tailwind.config.ts`](../tailwind.config.ts), [`postcss.config.mjs`](../postcss.config.mjs): styling pipeline.
- [`vitest.config.ts`](../vitest.config.ts): jsdom environment, setup file, alias.
- [`.eslintrc.json`](../.eslintrc.json), [`.gitignore`](../.gitignore), [`.env.example`](../.env.example).

## Phase 3 — Types, configuration & utilities ✅

- [`src/types/ai.ts`](../src/types/ai.ts), [`src/types/api.ts`](../src/types/api.ts): domain and API contracts.
- [`src/config/constants.ts`](../src/config/constants.ts): accepted types, limits, `DEFAULT_GEMMA_MODEL`, action catalogue.
- [`src/config/env.ts`](../src/config/env.ts): Zod-validated, fail-fast server configuration.
- [`src/lib/files/validation.ts`](../src/lib/files/validation.ts), [`src/lib/files/encoding.ts`](../src/lib/files/encoding.ts).
- [`src/lib/utilities/cn.ts`](../src/lib/utilities/cn.ts), [`src/lib/utilities/text.ts`](../src/lib/utilities/text.ts) (code-fence stripping, balanced-brace JSON extraction).

## Phase 4 — AI layer ✅

- [`src/lib/ai/schemas.ts`](../src/lib/ai/schemas.ts): output schema with lenient coercion.
- [`src/lib/ai/prompts/`](../src/lib/ai/prompts): shared system preamble (grounding + JSON contract) and per-action builders (analyze, summarize, explain, ask, quiz, action-plan).
- [`src/lib/ai/gemma-client.ts`](../src/lib/ai/gemma-client.ts): the sole `@google/genai` call site; inline-data parts, JSON output config, timeout, provider error normalisation.
- [`src/lib/ai/parser.ts`](../src/lib/ai/parser.ts): parse → validate → coerce → recover → fallback.
- [`src/lib/ai/service.ts`](../src/lib/ai/service.ts): orchestration.
- [`src/lib/errors.ts`](../src/lib/errors.ts): typed error hierarchy.

## Phase 5 — File handling & API route ✅

- [`src/lib/validation/request.ts`](../src/lib/validation/request.ts): request schema (question required for `ask`).
- [`src/services/analyze-service.ts`](../src/services/analyze-service.ts): validates + orchestrates + shapes the response.
- [`src/lib/http/responses.ts`](../src/lib/http/responses.ts): response envelope helpers.
- [`src/app/api/analyze/route.ts`](../src/app/api/analyze/route.ts): `POST` handler (Node runtime) + `GET` health probe.

## Phase 6 — UI components ✅

- Layout: [`src/app/layout.tsx`](../src/app/layout.tsx), [`Header`](../src/components/layout/Header.tsx), [`Footer`](../src/components/layout/Footer.tsx).
- Primitives: [`Button`](../src/components/ui/Button.tsx), [`Card`](../src/components/ui/Card.tsx), [`Badge`](../src/components/ui/Badge.tsx), [`Spinner`/`Skeleton`](../src/components/ui/Spinner.tsx), [`EmptyState`](../src/components/ui/EmptyState.tsx), [`Icons`](../src/components/ui/Icons.tsx).
- Feature components: [`UploadZone`](../src/features/copilot/components/UploadZone.tsx), [`FilePreview`](../src/features/copilot/components/FilePreview.tsx), [`ActionBar`](../src/features/copilot/components/ActionBar.tsx), [`QuestionInput`](../src/features/copilot/components/QuestionInput.tsx), [`ErrorAlert`](../src/features/copilot/components/ErrorAlert.tsx), [`ResultsSkeleton`](../src/features/copilot/components/ResultsSkeleton.tsx), [`CopyButton`](../src/features/copilot/components/CopyButton.tsx), [`ResultPanel`](../src/features/copilot/components/ResultPanel.tsx).

## Phase 7 — Feature orchestration ✅

- [`src/features/copilot/useCopilot.ts`](../src/features/copilot/useCopilot.ts): `useReducer`-based state owner (file selection, question, run lifecycle, preview URL cleanup).
- [`src/services/api-client.ts`](../src/services/api-client.ts): browser client with typed `ClientError`.
- [`src/features/copilot/CopilotWorkspace.tsx`](../src/features/copilot/CopilotWorkspace.tsx): composition root.
- [`src/app/page.tsx`](../src/app/page.tsx): landing + workspace.

## Phase 8 — Tests ✅

- Setup + fixtures: [`src/tests/setup.ts`](../src/tests/setup.ts), [`src/tests/fixtures.ts`](../src/tests/fixtures.ts).
- Unit/integration/UI tests across validation, encoding, text utilities, prompts, parser, env config, request schema, `GemmaClient`, `AiService`, `analyze-service`, and `ResultPanel`. See [`testing-strategy.md`](testing-strategy.md).

## Phase 9 — Open-source files ✅

- [`LICENSE`](../LICENSE) (Apache-2.0), [`README.md`](../README.md), [`CONTRIBUTING.md`](../CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md), [`.env.example`](../.env.example).

## Phase 9b — Gemma 4 runtime alignment ✅

- Added `DEFAULT_GEMMA_MODEL = 'gemma-4-26b-a4b-it'` in [`src/config/constants.ts`](../src/config/constants.ts).
- [`src/config/env.ts`](../src/config/env.ts): `GEMMA_MODEL` now defaults to Gemma 4 (was required).
- [`.env.example`](../.env.example): `GEMMA_MODEL=gemma-4-26b-a4b-it`.
- UI/metadata strings updated to reference "Gemma 4" ([`Header`](../src/components/layout/Header.tsx), [`page.tsx`](../src/app/page.tsx), [`layout.tsx`](../src/app/layout.tsx)).
- Env test updated to assert the Gemma 4 default.

## Phase 10 — Documentation ✅

- [`product-requirements.md`](product-requirements.md), [`architecture.md`](architecture.md), [`implementation-plan.md`](implementation-plan.md), [`testing-strategy.md`](testing-strategy.md), [`deployment.md`](deployment.md), [`hackathon-category-alignment.md`](hackathon-category-alignment.md).

## Phase 11 — Quality gates ⏳

- `npm install`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` — executed and recorded in the final report.

## Phase 12 — Final review & report ⏳

- End-to-end review and the consolidated engineering report.
