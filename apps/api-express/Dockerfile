# ============================================================
# Smart Climate Engine – API Express Gateway (Node.js)
# Multi-stage Dockerfile: development + production
# ============================================================

# ---------- Base ----------
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat curl
WORKDIR /app
ENV NODE_ENV=development

# ---------- Dependencies ----------
FROM base AS deps

COPY package.json package-lock.json* ./
RUN npm ci

# ---------- Development ----------
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 4000
CMD ["npm", "run", "dev"]

# ---------- Builder ----------
FROM base AS builder

ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Production ----------
FROM node:20-alpine AS production

RUN apk add --no-cache curl
WORKDIR /app

# Non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 express

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=express:nodejs /app/dist ./dist

USER express
EXPOSE 4000
ENV NODE_ENV=production PORT=4000
CMD ["node", "dist/index.js"]
