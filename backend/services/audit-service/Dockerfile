FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/audit-service ./services/audit-service
RUN cd services/audit-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/audit-service && npm install
RUN cd services/audit-service && npx prisma generate || true
RUN cd services/audit-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/audit-service/package.json ./services/audit-service/
RUN cd services/audit-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/audit-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/audit-service/dist ./services/audit-service/dist
COPY --from=build /app/services/audit-service/prisma ./services/audit-service/prisma
COPY --from=build /app/services/audit-service/node_modules/.prisma ./services/audit-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/audit-service
ENV PORT=3027
EXPOSE 3027
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3027/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
