# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates them via tool calls, and the result renders instantly in a sandboxed iframe.

## Commands

```bash
npm run setup        # First-time setup: install deps + Prisma generate + migrate
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all tests)
npm run db:reset     # Reset SQLite database
```

Run a single test file:
```bash
npx vitest run src/lib/file-system.test.ts
```

## Environment

Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`. Without it, the app falls back to a `MockLanguageModel` that generates static templates — useful for testing UI without API costs.

## Architecture

### Virtual File System (VFS)
`src/lib/file-system.ts` — The core abstraction. All "project files" live in memory as a plain JS object tree, never written to disk. Serialized to JSON for database storage. The `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) wraps this and exposes file ops to the rest of the app.

### AI Code Generation Flow
1. User message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. Server streams a response from Claude using the Vercel AI SDK
3. Claude calls two tools: `str_replace_editor` (create/read/modify files) and `file_manager` (rename/delete)
4. Tool call results update `FileSystemContext` in the browser
5. Preview iframe re-renders on every file change via `refreshTrigger`

The system prompt lives in `src/lib/prompts/generation.tsx`. The AI model is configured in `src/lib/provider.ts` (defaults to `claude-haiku-4-5-20251001`; falls back to mock when no API key is set).

### Preview Rendering
`src/components/preview/PreviewFrame.tsx` renders an `<iframe>` using:
- `@babel/standalone` (client-side) to transform JSX → JS (`src/lib/transform/jsx-transformer.ts`)
- Browser-native **import maps** to resolve module paths
- **Blob URLs** for transformed modules
- React and libraries loaded from `esm.sh` CDN

### Layout
`src/app/main-content.tsx` uses `react-resizable-panels`:
- Left panel (35%): `ChatInterface`
- Right panel (65%): tabs for Preview (`PreviewFrame`) or Code (file tree + Monaco editor)

### Auth
JWT stored in HTTP-only cookies (7-day expiry). `src/middleware.ts` protects routes. Server actions in `src/actions/index.ts` handle sign-up/sign-in. Anonymous users can generate components; a prompt to sign in appears before saving.

### Database
Prisma + SQLite. Two models: `User` and `Project`. A `Project` stores serialized VFS state (`data`) and chat history (`messages`) as JSON strings.

## Key Files

| File | Role |
|------|------|
| `src/lib/file-system.ts` | VirtualFileSystem class |
| `src/lib/contexts/file-system-context.tsx` | VFS React context + state |
| `src/lib/contexts/chat-context.tsx` | Chat + AI stream state |
| `src/lib/transform/jsx-transformer.ts` | Babel JSX transform + preview HTML generation |
| `src/lib/provider.ts` | AI model selection (real vs. mock) |
| `src/lib/prompts/generation.tsx` | Claude system prompt |
| `src/app/api/chat/route.ts` | Chat streaming API endpoint |
| `src/app/main-content.tsx` | Root layout with resizable panels |
| `prisma/schema.prisma` | DB schema |

## Testing

Tests use Vitest + jsdom + `@testing-library/react`. Coverage spans VFS operations, JSX transformation, all context providers, and key UI components. No database mocking — auth-related tests use unit-level isolation.
