## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `pnpm install`
2. Copy [.env.example](.env.example) to `.env` and set `VITE_GEMINI_API_KEY` (exposed to the browser — demo only)
3. Run: `pnpm dev`

## Architecture (demo)

- **Gemini agent** runs in the browser via `@google/genai`
- **Leads** persist in `sessionStorage` (tab session only)
- **`src/services/sheets.ts`** is kept for reference; Sheets sync is not wired in this client-only demo

## Deploy

Static deploy (Vercel, Netlify, etc.): `pnpm build` → serve `dist/`. Set `VITE_GEMINI_API_KEY` in the host’s environment variables.
