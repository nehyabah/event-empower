# Single-domain image: the API serves the built SPA from the same origin, so the
# auth cookie stays same-site and the frontend needs no build-time API URL.
FROM node:20-alpine AS builder
WORKDIR /app

# npm workspaces resolves the whole tree, so every workspace manifest must be
# present for `npm ci` — even the ones this image doesn't build.
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/

RUN npm ci --workspace=backend --workspace=apps/web --include-workspace-root

COPY backend/ ./backend/
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Vite inlines VITE_* at build time, and a Dockerfile sees Railway's variables
# only if it declares them as build args. Without this the Google button would
# compile out to nothing and simply never appear.
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# build:backend also copies the .sql migrations into dist (tsc emits JS only).
RUN npm run build:backend && npm run build:web

FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/

RUN npm ci --workspace=backend --include-workspace-root --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist
# app.ts looks for the SPA at ../web relative to dist/.
COPY --from=builder /app/apps/web/dist ./backend/web

WORKDIR /app/backend
EXPOSE 3001

# Migrations are tracked by filename and each runs in its own transaction, so
# re-running on every boot is a no-op; a failure aborts before the app starts.
CMD ["sh", "-c", "npm run migrate:prod && node dist/app.js"]
