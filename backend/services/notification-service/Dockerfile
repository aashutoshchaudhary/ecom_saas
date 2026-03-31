FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/notification-service ./services/notification-service
RUN cd services/notification-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/notification-service && npm install
RUN cd services/notification-service && npx prisma generate || true
RUN cd services/notification-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/notification-service/package.json ./services/notification-service/
RUN cd services/notification-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/notification-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/notification-service/dist ./services/notification-service/dist
COPY --from=build /app/services/notification-service/prisma ./services/notification-service/prisma
COPY --from=build /app/services/notification-service/node_modules/.prisma ./services/notification-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/notification-service
ENV PORT=3024
EXPOSE 3024
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3024/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
