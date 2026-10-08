# ========================================
# Multi-stage Dockerfile for Shark Tank AI
# Optimized for production deployment
# ========================================

# ── Stage 1: Build React Frontend ──────────────────────────────
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies (including dev for build)
RUN npm ci

# Copy client source
COPY client/ ./

# Build production bundle
RUN npm run build

# ── Stage 2: Production Server ─────────────────────────────────
FROM node:20-alpine AS production

# Add metadata
LABEL maintainer="Shark Tank AI Team"
LABEL description="AI-powered investor pitch simulation"
LABEL version="1.0.0"

WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy server package files
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy server source code
COPY server/ ./

# Copy built React app from client-builder stage
COPY --from=client-builder /app/client/dist ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV AI_MODE=mock
ENV AI_TIMEOUT_MS=2000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check - ensures container is serving correctly
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Start the server
CMD ["node", "server.js"]
