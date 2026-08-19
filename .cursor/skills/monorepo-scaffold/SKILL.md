---
name: monorepo-scaffold
description: >-
  Scaffold npm-workspace monorepos and add new apps/packages following the
  NetflixAdaptiveProject conventions (TypeScript, Prisma, Temporal, Docker).
  Use when creating a new monorepo, adding a workspace, bootstrapping apps
  (api/web/worker), packages (db/shared), or reproducing this repo layout.
---

# Monorepo Scaffold

Reproduce or extend the **NetflixAdaptiveProject** layout: npm workspaces, scoped packages, root `.env`, Docker infra, Prisma v7, Temporal worker.

## Before You Start

Gather from the user (or infer from context):

| Decision | Default in this repo |
|----------|---------------------|
| Scope prefix | `@adaptive-streaming` |
| Node version | `>=20` |
| Workspace globs | `apps/*`, `packages/*` |
| Infra stack | Postgres + Temporal + optional worker container |

Read [reference.md](reference.md) for file templates. Read root `CLAUDE.md` for day-to-day conventions.

## Decision Tree

```
New project entirely?     → "Bootstrap new monorepo"
Add app (api/web/worker)? → "Add app workspace"
Add shared library?       → "Add package workspace"
Clone infra only?         → Copy docker/ + .env.example
```

---

## Bootstrap New Monorepo

Copy this checklist and track progress:

```
- [ ] 1. Create root package.json with workspaces
- [ ] 2. Create .gitignore, .env.example
- [ ] 3. Scaffold packages/shared (build first — others depend on it)
- [ ] 4. Scaffold packages/db (Prisma v7 + adapter-pg)
- [ ] 5. Scaffold apps (api, web, worker as needed)
- [ ] 6. Add docker/docker-compose.yml
- [ ] 7. Add scripts/ utilities
- [ ] 8. npm install && verify builds
- [ ] 9. Copy CLAUDE.md and adjust scope/name
```

### Root `package.json` essentials

```json
{
  "name": "<project-kebab-name>",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "docker:up": "docker compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.yml down",
    "db:migrate": "npm run db:migrate -w @<scope>/db",
    "db:generate": "npm run db:generate -w @<scope>/db"
  },
  "engines": { "node": ">=20" }
}
```

Replace `<scope>` with the npm scope (e.g. `adaptive-streaming`).

### Build order (always)

1. `@<scope>/shared` — no internal deps
2. `@<scope>/db` — may depend on shared; run `db:generate` before build
3. Apps — depend on shared and/or db

---

## Add App Workspace

1. Create `apps/<name>/` with `package.json` named `@<scope>/<name>`.
2. Add `tsconfig.json` — use **CommonJS** for Node apps, **ESNext + bundler** for Vite/React.
3. Wire internal deps: `"@<scope>/shared": "*"` (and `"@<scope>/db": "*"` if needed).
4. Load env from repo root:

```typescript
// apps/<name>/src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
```

5. Dev script pattern (Node apps):

```json
"dev": "dotenv -e ../../.env -- concurrently --kill-others \"tsc -w\" \"nodemon --watch dist dist/index.js\""
```

6. Add root shortcut: `"dev:<name>": "npm run dev -w @<scope>/<name>"`.

### App type cheat sheet

| Type | Module | Port | Key deps |
|------|--------|------|----------|
| API | commonjs | 3000 | express, cors, dotenv-cli |
| Web | ESM (`"type": "module"`) | 5173 | vite, react, react-router-dom |
| Worker | commonjs | — | @temporalio/*, workflow bundle script |

Worker apps **must** include `build:workflows` step — see reference.md.

---

## Add Package Workspace

1. Create `packages/<name>/` with `package.json` named `@<scope>/<name>`.
2. Set entry points for libraries:

```json
"main": "./dist/index.js",
"types": "./dist/index.d.ts"
```

3. Standard `tsconfig.json`: target ES2022, module commonjs, `outDir: ./dist`, `rootDir: ./src`, `declaration: true`, `strict: true`.
4. Export from `src/index.ts`.
5. Add `"@<scope>/<name>": "*"` to consuming workspaces.

---

## Environment Conventions

- **Single root `.env`** — never commit; copy from `.env.example`.
- Backend/worker load via `dotenv-cli` in npm scripts OR `dotenv.config({ path: resolve to repo root })`.
- Frontend uses `VITE_` prefix only (`VITE_API_URL`).
- External data dirs (e.g. `MEDIA_ROOT`) live **outside** the repo and are mounted in Docker.

---

## Docker Conventions

- All compose files in `docker/docker-compose.yml`.
- Build context is repo root (`context: ..` from docker/).
- Worker Dockerfile: multi-stage, install workspace deps with `npm install --workspace=... --include-workspace-root`.
- Health checks on Postgres before Temporal starts.

---

## Prisma v7 Setup (packages/db)

Required files:

- `prisma/schema.prisma` — generator output to `../src/generated/client`
- `prisma.config.ts` — loads root `.env`, sets schema/migrations/datasource paths
- Scripts use `dotenv -e ../../.env -- prisma <cmd>`

Schema conventions (from workspace rules):

- Both sides of relations with `@relation`
- `@id @default(autoincrement())` or `@default(cuid())`
- `createdAt` / `updatedAt` timestamps
- `@@index` on frequently queried fields

Exclude `src/generated` from tsconfig; add to `.gitignore`.

---

## Verification Checklist

After scaffolding:

```bash
npm install
npm run build                    # all workspaces
npm run db:generate -w @<scope>/db
npm run docker:up
npm run dev:<app>                # smoke-test each app
```

Confirm:

- [ ] Workspace names are scoped and consistent
- [ ] Internal deps use `"*"` version
- [ ] All Node apps resolve root `.env`
- [ ] `dist/` and `node_modules/` are gitignored
- [ ] Docker worker build includes required packages in COPY order

---

## Additional Resources

- Full templates and copy-paste snippets: [reference.md](reference.md)
- Project-specific conventions and commands: root `CLAUDE.md`
