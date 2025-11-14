# Build stage for monorepo with pnpm
FROM node:20-alpine3.18 AS builder

# Install pnpm directly via npm
RUN npm install -g pnpm@10.10.0

WORKDIR /app

# Accept build arguments for NEXT_PUBLIC_* variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BETTER_AUTH_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

# Set build-time environment variables
# Use build args if provided, otherwise use placeholder values
ENV BETTER_AUTH_SECRET=build-time-placeholder-secret-key-for-docker-build
ENV BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL:-http://localhost:3000}
ENV NEXT_PUBLIC_BETTER_AUTH_URL=${NEXT_PUBLIC_BETTER_AUTH_URL:-http://localhost:3000}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3001}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-https://placeholder.supabase.co}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY:-placeholder-anon-key}
ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:-placeholder}
ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:-ml_default}
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:-placeholder}
ENV NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=${NEXT_PUBLIC_GOOGLE_PLACES_API_KEY:-placeholder}
ENV RESEND_API_KEY=build-time-placeholder-resend-key
ENV GOOGLE_CLIENT_ID=build-time-placeholder-google-client-id
ENV GOOGLE_CLIENT_SECRET=build-time-placeholder-google-client-secret
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV DIRECT_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder
ENV UPSTASH_REDIS_REST_URL=https://placeholder.upstash.io
ENV UPSTASH_REDIS_REST_TOKEN=placeholder-token
ENV SERVICE_AUTH_SECRET=build-time-placeholder-service-secret
ENV REVALIDATION_SECRET=build-time-placeholder-revalidation-secret
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV INTERNAL_API_KEY=build-time-placeholder-internal-api-key

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
