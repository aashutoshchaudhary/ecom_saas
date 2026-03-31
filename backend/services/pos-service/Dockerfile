FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate 2>/dev/null || true
RUN npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=build --chown=appuser:appgroup /app/package.json ./
COPY --from=build --chown=appuser:appgroup /app/prisma ./prisma
USER appuser
ENV PORT=3021
EXPOSE 3021
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3021/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
