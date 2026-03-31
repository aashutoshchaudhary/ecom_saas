FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/inventory-service ./services/inventory-service
RUN cd services/inventory-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/inventory-service && npm install
RUN cd services/inventory-service && npx prisma generate || true
RUN cd services/inventory-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/inventory-service/package.json ./services/inventory-service/
RUN cd services/inventory-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/inventory-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/inventory-service/dist ./services/inventory-service/dist
COPY --from=build /app/services/inventory-service/prisma ./services/inventory-service/prisma
COPY --from=build /app/services/inventory-service/node_modules/.prisma ./services/inventory-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/inventory-service
ENV PORT=3012
EXPOSE 3012
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3012/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
