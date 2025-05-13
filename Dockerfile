# Use Bun as base image
FROM oven/bun:1.0.25 as base

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    python3 \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json ./

# Install dependencies with specific esbuild version
RUN bun install --no-cache && \
    bun remove esbuild && \
    bun add esbuild@0.25.0

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install required dependencies in builder stage
RUN apt-get update && apt-get install -y \
    git \
    build-essential \
    python3 \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

# Set build-time environment variables
ENV NODE_ENV production
ENV DATABASE_URL "postgres://postgres:postgres@localhost:5432/postgres"
ENV NEXT_PUBLIC_APP_URL "http://localhost:3000"
ENV BETTER_AUTH_SECRET "your-auth-secret"
ENV STRIPE_SECRET_KEY "your-stripe-secret-key"
ENV STRIPE_WEBHOOK_SECRET "your-stripe-webhook-secret"
ENV STRIPE_PRO_PRICE_ID "your-stripe-price-id"
ENV RESEND_API_KEY "your-resend-api-key"

# Build the application
RUN bun run build

# Verify build output and create standalone directory if it doesn't exist
RUN if [ ! -d ".next/standalone" ]; then \
        echo "Creating standalone directory..." && \
        mkdir -p .next/standalone && \
        cp -r .next/server .next/standalone/ && \
        cp -r .next/static .next/standalone/ && \
        cp package.json .next/standalone/ && \
        cp next.config.mjs .next/standalone/; \
    fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir -p .next/static
RUN chown -R nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["bun", "server.js"] 