# Build stage for monorepo with pnpm
FROM node:20-alpine3.18 AS builder

# Install pnpm directly via npm
RUN npm install -g pnpm@10.10.0

WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY tsconfig.json turbo.json ./

# Copy package.json files for all workspace packages
COPY packages/db/package.json ./packages/db/
COPY apps/next-frontend/package.json ./apps/next-frontend/

# Copy essential source files for packages that build needs
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/src ./packages/db/src
COPY packages/db/tsconfig.json ./packages/db/
COPY packages/db/tsup.config.ts ./packages/db/

# Copy next-frontend source
COPY apps/next-frontend ./apps/next-frontend

# Install dependencies using pnpm with workspace support
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter=@repo/db run db:generate

# Build arguments for required environment variables
ARG BETTER_AUTH_SECRET
ARG BETTER_AUTH_URL
ARG DATABASE_URL
ARG RESEND_API_KEY

# Validate that required build arguments are provided
RUN test -n "$BETTER_AUTH_SECRET" || (echo "Error: BETTER_AUTH_SECRET is required" && exit 1) && \
    test -n "$BETTER_AUTH_URL" || (echo "Error: BETTER_AUTH_URL is required" && exit 1) && \
    test -n "$DATABASE_URL" || (echo "Error: DATABASE_URL is required" && exit 1) && \
    test -n "$RESEND_API_KEY" || (echo "Error: RESEND_API_KEY is required" && exit 1)

# Set environment variables from build arguments
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
    BETTER_AUTH_URL=$BETTER_AUTH_URL \
    DATABASE_URL=$DATABASE_URL \
    RESEND_API_KEY=$RESEND_API_KEY

# Build only the db package and next-frontend
RUN pnpm --filter=@repo/db run build
RUN pnpm --filter=ticketeate run build

# Runner stage
FROM node:20-alpine3.18 AS runner

# Install pnpm directly via npm
RUN npm install -g pnpm@10.10.0

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./

# Copy built packages
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/apps/next-frontend/.next ./apps/next-frontend/.next
COPY --from=builder /app/apps/next-frontend/public ./apps/next-frontend/public
COPY --from=builder /app/apps/next-frontend/package.json ./apps/next-frontend/
COPY --from=builder /app/apps/next-frontend/next.config.mjs ./apps/next-frontend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

WORKDIR /app/apps/next-frontend

EXPOSE 3000

CMD ["pnpm", "start"]
