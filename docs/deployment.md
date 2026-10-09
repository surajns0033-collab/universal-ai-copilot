# Deployment — Universal AI Copilot

Universal AI Copilot is a standard Next.js 15 application. It deploys to Vercel, DigitalOcean App Platform, or any host that runs Node.js.

## 1. Requirements

- Node.js **>= 18.18.0**
- A Google AI Studio API key with access to the Gemini API / Gemma models
- The environment variables in [Configuration](#3-configuration)
- The API route must run on the **Node.js runtime** (required by the `@google/genai` SDK); this is already set in [`src/app/api/analyze/route.ts`](../src/app/api/analyze/route.ts).

## 2. Build & run

```bash
npm install
npm run build
npm start
```

The app listens on `PORT` (default `3000`).

## 3. Configuration

Set these in your hosting provider's **secret store** — never in the repository.

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | ✅ | — | Server-only. Never expose to the client. |
| `GEMMA_MODEL` | ❌ | `gemma-4-26b-a4b-it` | The Gemma model identifier. |
| `MAX_UPLOAD_MB` | ❌ | `15` | Maximum upload size. |
| `AI_REQUEST_TIMEOUT_MS` | ❌ | `45000` | Per-request AI timeout. |

> If the host enforces a request body limit (common on serverless platforms), ensure it is at least as large as `MAX_UPLOAD_MB` after base64 inflation (base64 adds ~33%). For the default 15 MB this is roughly 20 MB.

## 4. Platform notes

### Vercel

1. Import the repository.
2. Add the environment variables for Production/Preview/Development.
3. Deploy — the framework preset handles the build.
4. Confirm the API route uses the Node runtime (already configured).

### DigitalOcean App Platform

1. Create an App from the repository.
2. Set the build command to `npm run build` and the run command to `npm start`.
3. Add the environment variables as **encrypted** app-level variables.
4. Set the HTTP port to match `PORT`.

### Any Node host (Docker, VM, etc.)

1. Build: `npm install && npm run build`.
2. Run: `npm start` with the environment variables exported.
3. Terminate TLS at your proxy/load balancer.

## 5. Post-deploy verification

- `GET /api/analyze` returns a health payload indicating readiness and the configured model.
- Uploading a file and running **Analyze** returns a structured result.
- The API key is not present anywhere in the client bundle.

## 6. Security checklist

- [ ] `GEMINI_API_KEY` stored in the platform secret store (not in code, not `NEXT_PUBLIC_`).
- [ ] HTTPS enforced.
- [ ] Security headers present (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- [ ] Request body limits accommodate `MAX_UPLOAD_MB`.
- [ ] Logs do not contain the key or full user content.

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `CONFIGURATION_ERROR` at request time | Missing `GEMINI_API_KEY` | Set the variable in the environment. |
| `CONFIGURATION_ERROR` mentioning the model | Invalid/unauthorised `GEMMA_MODEL` | Verify the model ID and key access. |
| `AI_RATE_LIMITED` | Provider quota/rate limit | Retry later or raise quota. |
| `AI_TIMEOUT` | Slow request or low timeout | Increase `AI_REQUEST_TIMEOUT_MS`. |
| `413`/body-too-large | Platform body limit below the upload | Raise the limit or reduce `MAX_UPLOAD_MB`. |
| Build fails on the API route | Runtime not Node | Ensure `export const runtime = 'nodejs'` is present. |
