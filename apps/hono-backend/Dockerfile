# Use the official AWS Lambda Node.js 18 runtime as base
FROM --platform=linux/amd64 public.ecr.aws/lambda/nodejs:18

# Set working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the TypeScript application
RUN pnpm run build

# Remove dev dependencies to reduce image size
RUN pnpm prune --prod

# Set the handler
CMD ["dist/lambda.handler"]
