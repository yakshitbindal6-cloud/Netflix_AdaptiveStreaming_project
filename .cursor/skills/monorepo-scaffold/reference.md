# Monorepo Scaffold — Reference Templates

Replace `<scope>`, `<app>`, `<package>`, and `<ProjectName>` placeholders.

## Directory Layout

```
<ProjectName>/
├── apps/
│   ├── api/                 # Express REST API
│   ├── web/                 # React + Vite SPA
│   └── worker/              # Temporal worker (+ Dockerfile)
├── packages/
│   ├── db/                  # Prisma client + migrations
│   └── shared/              # Shared types, constants, utils
├── docker/
│   ├── docker-compose.yml
│   └── temporal/dynamicconfig/
├── scripts/
│   └── init-media.sh        # optional; adapt to project needs
├── .env.example
├── .gitignore
├── CLAUDE.md
└── package.json
```

---

## .gitignore

```
node_modules/
dist/
build/
generated/
packages/db/src/generated/
.env
.env.local
*.log
.DS_Store
coverage/
```

---

## .env.example

```bash
# External storage (outside repo — mount in Docker)
MEDIA_ROOT=/path/to/external-media

# API
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/<db_name>
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_TASK_QUEUE=<task-queue-name>
CORS_ORIGIN=http://localhost:5173

# Worker
FFMPEG_PATH=ffmpeg
FFPROBE_PATH=ffprobe

# Web (Vite — only VITE_ vars exposed to browser)
VITE_API_URL=http://localhost:3000
```

---

## packages/shared

### package.json

```json
{
  "name": "@<scope>/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc -w"
  },
  "devDependencies": {
    "@types/node": "^22.10.3",
    "typescript": "^5.7.2"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "declaration": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## packages/db

### package.json

```json
{
  "name": "@<scope>/db",
  "version": "0.1.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "db:generate": "dotenv -e ../../.env -- prisma generate",
    "db:migrate": "dotenv -e ../../.env -- prisma migrate dev",
    "db:push": "dotenv -e ../../.env -- prisma db push"
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.0.0",
    "@prisma/client": "^7.0.0",
    "dotenv": "^16.4.7",
    "pg": "^8.13.1"
  },
  "devDependencies": {
    "@types/node": "^22.10.3",
    "@types/pg": "^8.11.10",
    "dotenv-cli": "^8.0.0",
    "prisma": "^7.0.0",
    "typescript": "^5.7.2"
  }
}
```

### prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/client"
}

datasource db {
  provider = "postgresql"
}
```

### prisma.config.ts

```typescript
import path from 'path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

loadEnv({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'prisma/migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

### tsconfig.json

Same as shared, plus exclude generated client:

```json
"exclude": ["node_modules", "dist", "src/generated"]
```

### src/index.ts (starter)

```typescript
// Re-export Prisma client once models are added:
// export { prisma } from './client';
export {};
```

---

## apps/api

### package.json

```json
{
  "name": "@<scope>/api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "tsc",
    "dev": "dotenv -e ../../.env -- concurrently --kill-others \"tsc -w\" \"nodemon --watch dist dist/index.js\"",
    "start": "dotenv -e ../../.env -- node dist/index.js"
  },
  "dependencies": {
    "@<scope>/db": "*",
    "@<scope>/shared": "*",
    "@temporalio/client": "^1.11.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.10.3",
    "concurrently": "^9.1.2",
    "dotenv-cli": "^8.0.0",
    "nodemon": "^3.1.9",
    "typescript": "^5.7.2"
  }
}
```

### src/config/index.ts

```typescript
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL!,
  temporalAddress: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  temporalTaskQueue: process.env.TEMPORAL_TASK_QUEUE || 'default',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
```

---

## apps/web

### package.json

```json
{
  "name": "@<scope>/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.1"
  },
  "devDependencies": {
    "@types/react": "^19.0.2",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.6"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
```

---

## apps/worker

### package.json

```json
{
  "name": "@<scope>/worker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "tsc && npm run build:workflows",
    "build:workflows": "node ./scripts/build-workflow-bundle.js",
    "dev": "npm run build && dotenv -e ../../.env -- node dist/worker.js",
    "start": "dotenv -e ../../.env -- node dist/worker.js"
  },
  "dependencies": {
    "@<scope>/db": "*",
    "@<scope>/shared": "*",
    "@temporalio/activity": "^1.11.7",
    "@temporalio/client": "^1.11.7",
    "@temporalio/worker": "^1.11.7",
    "@temporalio/workflow": "^1.11.7",
    "dotenv": "^16.4.7"
  },
  "devDependencies": {
    "@types/node": "^22.10.3",
    "dotenv-cli": "^8.0.0",
    "typescript": "^5.7.2"
  }
}
```

### scripts/build-workflow-bundle.js

```javascript
const { bundleWorkflowCode } = require('@temporalio/worker');
const { writeFile } = require('fs/promises');
const path = require('path');

async function build() {
  const { code } = await bundleWorkflowCode({
    workflowsPath: path.join(__dirname, '../src/workflows'),
  });
  const codePath = path.join(__dirname, '../dist/workflow-bundle.js');
  await writeFile(codePath, code);
  console.log(`Workflow bundle written to ${codePath}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### Worker Dockerfile (multi-stage)

```dockerfile
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/worker/package.json ./apps/worker/

RUN npm install --workspace=@<scope>/worker --include-workspace-root

COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker

RUN npm run build -w @<scope>/shared
RUN npm run build -w @<scope>/worker

FROM node:20-bookworm-slim AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/worker ./apps/worker
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
WORKDIR /app/apps/worker
CMD ["node", "dist/worker.js"]
```

When worker needs db package, add COPY + build steps for `packages/db` and run `db:generate` before build.

---

## docker/docker-compose.yml (minimal)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: <db_name>
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 10

  temporal:
    image: temporalio/auto-setup:1.25.2
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DB: postgres12
      DB_PORT: 5432
      POSTGRES_USER: postgres
      POSTGRES_PWD: postgres
      POSTGRES_SEEDS: postgres
    ports:
      - "7233:7233"

  temporal-ui:
    image: temporalio/ui:2.31.2
    depends_on:
      - temporal
    environment:
      TEMPORAL_ADDRESS: temporal:7233
      TEMPORAL_CORS_ORIGINS: http://localhost:5173
    ports:
      - "8080:8080"

volumes:
  postgres_data:
```

---

## Naming Conventions

| Item | Pattern | Example |
|------|---------|---------|
| npm scope | `@<kebab-scope>` | `@adaptive-streaming` |
| App package | `@<scope>/<short-name>` | `@adaptive-streaming/api` |
| Package | `@<scope>/<purpose>` | `@adaptive-streaming/db` |
| Root scripts | `dev:<app>`, `docker:up` | Consistent across repos |
| Env loading | Root `.env` only | Never per-workspace `.env` files |
| Config module | `src/config/index.ts` | Typed, with defaults |
| Docker context | Repo root | `context: ..` from `docker/` |

---

## Adapting for a New Project

1. Choose scope and repo name.
2. Decide which apps are needed (not every project needs worker/web).
3. Strip Temporal/FFmpeg from docker and worker if not needed.
4. Replace `MEDIA_ROOT` with project-specific external storage or remove entirely.
5. Update `CLAUDE.md` scope references.
6. Copy `.cursor/skills/monorepo-scaffold/` to the new repo for agent reuse.
