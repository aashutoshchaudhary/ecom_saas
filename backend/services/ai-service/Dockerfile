FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/ai-service ./services/ai-service
RUN cd services/ai-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/ai-service && npm install
RUN cd services/ai-service && npx prisma generate || true
RUN cd services/ai-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/ai-service/package.json ./services/ai-service/
RUN cd services/ai-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/ai-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/ai-service/dist ./services/ai-service/dist
COPY --from=build /app/services/ai-service/prisma ./services/ai-service/prisma
COPY --from=build /app/services/ai-service/node_modules/.prisma ./services/ai-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/ai-service
ENV PORT=3009
EXPOSE 3009
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3009/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
