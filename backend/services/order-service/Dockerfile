FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/order-service ./services/order-service
RUN cd services/order-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/order-service && npm install
RUN cd services/order-service && npx prisma generate || true
RUN cd services/order-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/order-service/package.json ./services/order-service/
RUN cd services/order-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/order-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/order-service/dist ./services/order-service/dist
COPY --from=build /app/services/order-service/prisma ./services/order-service/prisma
COPY --from=build /app/services/order-service/node_modules/.prisma ./services/order-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/order-service
ENV PORT=3014
EXPOSE 3014
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3014/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
