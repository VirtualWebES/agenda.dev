# Use Node.js as base image
FROM node:20-slim as base

# Install Bun
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/* \
    && curl -fsSL https://bun.sh/install | bash \
    && echo 'export BUN_INSTALL="$HOME/.bun"' >> /root/.bashrc \
    && echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> /root/.bashrc \
    && export BUN_INSTALL="$HOME/.bun" \
    && export PATH="$BUN_INSTALL/bin:$PATH"

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
ENV BUN_INSTALL="/root/.bun"
ENV PATH="/root/.bun/bin:${PATH}"

# Install dependencies with specific esbuild version
RUN /root/.bun/bin/bun install --no-cache && \
    /root/.bun/bin/bun remove esbuild && \
    /root/.bun/bin/bun add esbuild@0.25.0

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

# Set build-time environment variables
ENV NODE_ENV production
ENV DATABASE_URL "postgres://postgres:postgres@localhost:5432/postgres"
ENV NEXT_PUBLIC_APP_URL "http://localhost:3000"
ENV AUTH_SECRET "your-auth-secret"
ENV POSTHOG_KEY "your-posthog-key"
ENV POSTHOG_HOST "https://us.i.posthog.com"
ENV STRIPE_SECRET_KEY "your-stripe-secret-key"
ENV STRIPE_WEBHOOK_SECRET "your-stripe-webhook-secret"
ENV RESEND_API_KEY "your-resend-api-key"

# Debug information
RUN echo "=== System Information ===" && \
    ls -la && \
    echo "\n=== Node Information ===" && \
    node --version && \
    echo "\n=== Bun Information ===" && \
    /root/.bun/bin/bun --version && \
    echo "\n=== NPM Information ===" && \
    npm --version && \
    echo "\n=== Package.json Contents ===" && \
    cat package.json && \
    echo "\n=== Node Modules Contents ===" && \
    ls -la node_modules && \
    echo "\n=== Environment Variables ===" && \
    env | sort

# Build the application with detailed error output
RUN echo "\n=== Starting Build ===" && \
    /root/.bun/bin/bun run build 2>&1 | tee build.log || \
    (echo "Build failed with exit code $?" && \
     echo "\n=== Build Log Contents ===" && \
     cat build.log && \
     echo "\n=== Next.js Build Cache ===" && \
     ls -la .next/cache 2>/dev/null || echo "No build cache found" && \
     echo "\n=== Next.js Build Directory ===" && \
     ls -la .next 2>/dev/null || echo "No .next directory found" && \
     exit 1)

# Verify build output
RUN echo "\n=== Verifying Build Output ===" && \
    ls -la .next && \
    echo "\n=== Standalone Directory ===" && \
    ls -la .next/standalone 2>/dev/null || echo "Standalone directory not found" && \
    echo "\n=== Static Directory ===" && \
    ls -la .next/static 2>/dev/null || echo "Static directory not found"

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV BUN_INSTALL="/root/.bun"
ENV PATH="/root/.bun/bin:${PATH}"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir -p .next/static
RUN chown -R nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["/root/.bun/bin/bun", "server.js"] 