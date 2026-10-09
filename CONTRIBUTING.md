# Contributing to Universal AI Copilot

Thanks for your interest in improving Universal AI Copilot. This project is open source under the Apache-2.0 license and welcomes contributions of all sizes — bug reports, documentation, tests, and features.

By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Ways to contribute

- **Report a bug** — open an issue with a clear description, steps to reproduce, and expected vs. actual behaviour.
- **Suggest a feature** — open an issue describing the problem it solves and the proposed approach.
- **Improve documentation** — fix typos, clarify setup, add examples.
- **Improve tests** — edge cases for validation, parsing, prompts, or UI.
- **Submit code** — bug fixes and well-scoped features.

For anything beyond a small fix, please **open an issue first** so we can agree on the approach before you invest time.

---

## Development setup

### Prerequisites

- Node.js **>= 18.18.0**
- A Google AI Studio API key (only needed to run the app; **not** needed to run tests)

### Steps

```bash
git clone <your-repo-url>
cd "AITD 3 PROJECT CHALLENGE"
npm install
cp .env.example .env.local   # set GEMINI_API_KEY for local runs
npm run dev                  # http://localhost:3000
```

> Never commit `.env.local` or any file containing real credentials. `.gitignore` already excludes them.

---

## Quality gates

All of these must pass with **zero errors** before a pull request is ready:

```bash
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm test              # Vitest (no live API key required)
npm run build         # Next.js production build
```

Please also keep the codebase formatted:

```bash
npm run format
```

---

## Architecture guidelines

The project uses strict layering with dependencies pointing inward. Please respect these boundaries:

```
Presentation (src/app, src/components, src/features)
   → Application Service (src/services)
      → AI Service (src/lib/ai/service.ts)
         → GemmaClient (src/lib/ai/gemma-client.ts)
            → @google/genai SDK → Gemini API → Gemma 4
```

Rules of thumb:

- **Never** call the AI provider from a React component. All provider calls are server-side.
- **Never** read secrets (e.g. `GEMINI_API_KEY`) in client code, and **never** use the `NEXT_PUBLIC_` prefix for them.
- **Never** hardcode the model name — it comes from `GEMMA_MODEL` (see [`src/config/constants.ts`](src/config/constants.ts) and [`src/config/env.ts`](src/config/env.ts)).
- Keep feature logic out of presentational components, and keep components small and single-purpose.
- Add shared constants to [`src/config/constants.ts`](src/config/constants.ts) rather than duplicating magic strings/numbers.
- Add or update tests alongside behavioural changes.

---

## Coding standards

- **TypeScript strict** — no `any`; prefer explicit, narrow types.
- **Imports** — use the `@/` path alias for `src`.
- **Naming** — clear and descriptive; avoid abbreviations that obscure meaning.
- **Errors** — use the typed error hierarchy in [`src/lib/errors.ts`](src/lib/errors.ts); never leak stack traces to users.
- **Rendering AI output** — always render as text. **Never** use `dangerouslySetInnerHTML`.
- **Comments** — explain *why*, not *what*; keep them concise.

---

## Testing guidance

- Tests must not require a live API key and must not make network calls. Mock the provider.
- Use the fakes in [`src/tests/fixtures.ts`](src/tests/fixtures.ts) for AI behaviour (e.g. `createFakeGenAiClient`, `createRateLimitedClient`).
- Cover the happy path **and** failure paths (invalid files, malformed model output, provider errors, timeouts).
- See [`docs/testing-strategy.md`](docs/testing-strategy.md) for the full approach.

---

## Pull request process

1. Fork the repository and create a topic branch (e.g. `fix/parser-fallback`).
2. Make focused changes; keep commits small and descriptive.
3. Add or update tests and documentation where relevant.
4. Run all [quality gates](#quality-gates) locally and ensure they pass.
5. Open a pull request describing **what** changed and **why**, linking any related issue.

A maintainer will review as soon as possible. Please be responsive to feedback.

---

## Commit messages

Write clear, imperative commit messages:

- `fix: handle empty model response in parser`
- `feat: add TXT file support to upload zone`
- `docs: clarify Gemma 4 configuration`
- `test: cover rate-limit error mapping`

---

## License

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](LICENSE).
