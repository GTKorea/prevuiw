FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/

# Install all dependencies (not --prod, need devDeps for build)
RUN pnpm install --frozen-lockfile

# Copy API source
COPY apps/api/ ./apps/api/

# Generate Prisma client + Build
RUN cd apps/api && npx prisma generate && pnpm build

# Production install in a clean directory
RUN mkdir /prod && \
    cp apps/api/package.json /prod/ && \
    cp pnpm-lock.yaml /prod/ && \
    cd /prod && \
    corepack enable && \
    pnpm install --prod --ignore-workspace

# Copy prisma client to prod node_modules
RUN cp -r /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma /prod/node_modules/.prisma 2>/dev/null || \
    find /app -path "*node_modules/.prisma" -type d -exec cp -r {} /prod/node_modules/.prisma \; 2>/dev/null || true

FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y \
    openssl \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libpango-1.0-0 libcairo2 \
    libasound2 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy prod dependencies + prisma client
COPY --from=builder /prod/node_modules ./node_modules

# Copy built app + prisma schema
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/apps/api/package.json ./

RUN npx playwright install chromium

ENV NODE_ENV=production
EXPOSE 3012

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app
USER app

CMD ["node", "dist/main"]
