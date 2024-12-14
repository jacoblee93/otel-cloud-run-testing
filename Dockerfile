# Build stage
FROM node:20-slim AS builder

WORKDIR /app

RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Production stage
FROM node:20-slim

WORKDIR /app

# Enable corepack and prepare pnpm in production stage too
RUN corepack enable

# Copy from builder stage
COPY --from=builder /app ./

# Expose the port your app runs on (adjust if needed)
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
