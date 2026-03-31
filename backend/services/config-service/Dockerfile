FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/config-service ./services/config-service
RUN cd services/config-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/config-service && npm install
RUN cd services/config-service && npx prisma generate || true
RUN cd services/config-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/config-service/package.json ./services/config-service/
RUN cd services/config-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/config-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/config-service/dist ./services/config-service/dist
COPY --from=build /app/services/config-service/prisma ./services/config-service/prisma
COPY --from=build /app/services/config-service/node_modules/.prisma ./services/config-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/config-service
ENV PORT=3026
EXPOSE 3026
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3026/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
