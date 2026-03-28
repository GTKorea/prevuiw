FROM node:22-slim AS builder

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN pnpm build

FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y \
    openssl \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxrandr2 libgbm1 libpango-1.0-0 libcairo2 \
    libasound2 libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

RUN npx playwright install chromium

ENV NODE_ENV=production
EXPOSE 3012

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 app
USER app

CMD ["node", "dist/main"]
