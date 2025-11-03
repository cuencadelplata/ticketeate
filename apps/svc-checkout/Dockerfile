# Build stage for monorepo with pnpm
FROM node:20-alpine3.18 AS builder

# Install pnpm
RUN npm install -g pnpm@10.10.0

WORKDIR /app

# Copy workspace configuration files
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY tsconfig.json turbo.json ./

# Copy package.json files for workspace packages
COPY packages/db/package.json ./packages/db/
COPY apps/svc-checkout/package.json ./apps/svc-checkout/

# Copy essential source files for packages
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/src ./packages/db/src
COPY packages/db/tsconfig.json ./packages/db/
COPY packages/db/tsup.config.ts ./packages/db/

# Copy svc-checkout source
COPY apps/svc-checkout ./apps/svc-checkout

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter=@repo/db run db:generate

# Build db package and service
RUN pnpm --filter=@repo/db run build
RUN pnpm --filter=@ticketeate/svc-checkout run build

# Runner stage
FROM node:20-alpine3.18 AS runner

# Install pnpm
RUN npm install -g pnpm@10.10.0

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Copy built packages
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/apps/svc-checkout/package.json ./apps/svc-checkout/
COPY --from=builder /app/apps/svc-checkout/dist ./apps/svc-checkout/dist
COPY --from=builder /app/apps/svc-checkout/node_modules ./apps/svc-checkout/node_modules

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port
EXPOSE 3001

# Start the service
CMD ["node", "apps/svc-checkout/dist/index.js"]
