FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci --workspace=backend --include-workspace-root

COPY backend/ ./backend/
COPY packages/ ./packages/

RUN npm run build:backend

FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY packages/shared/package.json ./packages/shared/

RUN npm ci --workspace=backend --include-workspace-root --omit=dev

COPY --from=builder /app/backend/dist ./backend/dist

WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "dist/app.js"]
