FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy API source
COPY apps/api/ ./apps/api/

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build
RUN cd apps/api && pnpm build

# Deploy: creates a standalone bundle with all deps resolved
RUN pnpm deploy --filter @prevuiw/api --prod --legacy /app/deployed

# Copy built files and schema into deployed
RUN cp -r /app/apps/api/dist /app/deployed/dist
RUN cp -r /app/apps/api/prisma /app/deployed/prisma

# Re-generate Prisma client inside deployed bundle
RUN cd /app/deployed && npx prisma generate

FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y \
    openssl \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libpango-1.0-0 libcairo2 \
    libasound2 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/deployed ./

RUN npx playwright install chromium

ENV NODE_ENV=production
EXPOSE 3012

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app
USER app

CMD ["node", "dist/main"]
