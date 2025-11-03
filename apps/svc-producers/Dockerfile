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
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY apps/svc-producers/package.json ./apps/svc-producers/

# Copy essential source files for packages
COPY packages/db/prisma ./packages/db/prisma
COPY packages/db/src ./packages/db/src
COPY packages/db/tsconfig.json ./packages/db/
COPY packages/db/tsup.config.ts ./packages/db/
COPY packages/eslint-config ./packages/eslint-config
COPY packages/typescript-config ./packages/typescript-config

# Copy svc-producers source
COPY apps/svc-producers ./apps/svc-producers

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter=@repo/db run db:generate

# Build db package and service
RUN pnpm --filter=@repo/db run build
RUN pnpm --filter=@ticketeate/svc-producers run build

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
COPY --from=builder /app/apps/svc-producers/package.json ./apps/svc-producers/
COPY --from=builder /app/apps/svc-producers/dist ./apps/svc-producers/dist
COPY --from=builder /app/apps/svc-producers/node_modules ./apps/svc-producers/node_modules

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Set NODE_ENV
ENV NODE_ENV=production

# Expose port
EXPOSE 3003

# Start the service
CMD ["node", "apps/svc-producers/dist/index.js"]
