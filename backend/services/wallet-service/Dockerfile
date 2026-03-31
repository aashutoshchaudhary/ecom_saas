FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/wallet-service ./services/wallet-service
RUN cd services/wallet-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/wallet-service && npm install
RUN cd services/wallet-service && npx prisma generate || true
RUN cd services/wallet-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/wallet-service/package.json ./services/wallet-service/
RUN cd services/wallet-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/wallet-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/wallet-service/dist ./services/wallet-service/dist
COPY --from=build /app/services/wallet-service/prisma ./services/wallet-service/prisma
COPY --from=build /app/services/wallet-service/node_modules/.prisma ./services/wallet-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/wallet-service
ENV PORT=3017
EXPOSE 3017
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3017/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
