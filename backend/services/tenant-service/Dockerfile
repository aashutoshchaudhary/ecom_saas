FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/tenant-service ./services/tenant-service
RUN cd services/tenant-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/tenant-service && npm install
RUN cd services/tenant-service && npx prisma generate || true
RUN cd services/tenant-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/tenant-service/package.json ./services/tenant-service/
RUN cd services/tenant-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/tenant-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/tenant-service/dist ./services/tenant-service/dist
COPY --from=build /app/services/tenant-service/prisma ./services/tenant-service/prisma
COPY --from=build /app/services/tenant-service/node_modules/.prisma ./services/tenant-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/tenant-service
ENV PORT=3004
EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3004/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
