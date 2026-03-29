# ── Build stage ──
FROM node:22-alpine AS builder

RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json apps/api/

# Install ALL dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api/ apps/api/

# Generate Prisma client + Build API
RUN cd apps/api && npx prisma generate
RUN pnpm --filter @prevuiw/api build

# ── Production stage ──
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl chromium

WORKDIR /app

# Copy node_modules (includes Prisma generated client)
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/apps/api/node_modules apps/api/node_modules

# Copy built artifacts + config
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/apps/api/prisma apps/api/prisma
COPY --from=builder /app/apps/api/package.json apps/api/
COPY --from=builder /app/package.json ./

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium-browser
EXPOSE 3012

CMD ["node", "dist/main"]
