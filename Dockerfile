# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/playwright:v1.48.2-jammy

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.12.2 --activate

COPY package.json tsconfig.json playwright.config.ts ./
RUN pnpm install --frozen-lockfile || pnpm install

COPY src ./src
COPY .env.example ./.env.example

ENV NODE_ENV=production

CMD ["pnpm","schedule"]