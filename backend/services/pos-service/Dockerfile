FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/pos-service ./services/pos-service
RUN cd services/pos-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/pos-service && npm install
RUN cd services/pos-service && npx prisma generate || true
RUN cd services/pos-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/pos-service/package.json ./services/pos-service/
RUN cd services/pos-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/pos-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/pos-service/dist ./services/pos-service/dist
COPY --from=build /app/services/pos-service/prisma ./services/pos-service/prisma
COPY --from=build /app/services/pos-service/node_modules/.prisma ./services/pos-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/pos-service
ENV PORT=3021
EXPOSE 3021
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3021/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
