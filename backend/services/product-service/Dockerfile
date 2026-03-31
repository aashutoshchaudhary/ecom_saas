FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/product-service ./services/product-service
RUN cd services/product-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/product-service && npm install
RUN cd services/product-service && npx prisma generate || true
RUN cd services/product-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/product-service/package.json ./services/product-service/
RUN cd services/product-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/product-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/product-service/dist ./services/product-service/dist
COPY --from=build /app/services/product-service/prisma ./services/product-service/prisma
COPY --from=build /app/services/product-service/node_modules/.prisma ./services/product-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/product-service
ENV PORT=3011
EXPOSE 3011
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3011/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
