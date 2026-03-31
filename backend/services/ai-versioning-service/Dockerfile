FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/ai-versioning-service ./services/ai-versioning-service
RUN cd services/ai-versioning-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/ai-versioning-service && npm install
RUN cd services/ai-versioning-service && npx prisma generate || true
RUN cd services/ai-versioning-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/ai-versioning-service/package.json ./services/ai-versioning-service/
RUN cd services/ai-versioning-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/ai-versioning-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/ai-versioning-service/dist ./services/ai-versioning-service/dist
COPY --from=build /app/services/ai-versioning-service/prisma ./services/ai-versioning-service/prisma
COPY --from=build /app/services/ai-versioning-service/node_modules/.prisma ./services/ai-versioning-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/ai-versioning-service
ENV PORT=3010
EXPOSE 3010
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3010/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
