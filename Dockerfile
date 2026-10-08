# ── Stage 1: Build React frontend ──────────────────────────────
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --omit=dev
COPY client/ ./
RUN npm run build

# ── Stage 2: Production server ──────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy server source
COPY server/ ./

# Copy built frontend into server's public folder
COPY --from=client-builder /app/client/dist ./public

# Serve static files from Express
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]
