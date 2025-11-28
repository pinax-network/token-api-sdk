# Use official Bun image
FROM oven/bun:1.3.2-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source files
COPY . .

# Create entrypoint script
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'exec bun run /app/cli.ts "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Set entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Default command (show help)
CMD ["help"]