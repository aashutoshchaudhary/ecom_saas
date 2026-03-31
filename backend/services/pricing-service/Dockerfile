FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/pricing-service ./services/pricing-service
RUN cd services/pricing-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/pricing-service && npm install
RUN cd services/pricing-service && npx prisma generate || true
RUN cd services/pricing-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/pricing-service/package.json ./services/pricing-service/
RUN cd services/pricing-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/pricing-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/pricing-service/dist ./services/pricing-service/dist
COPY --from=build /app/services/pricing-service/prisma ./services/pricing-service/prisma
COPY --from=build /app/services/pricing-service/node_modules/.prisma ./services/pricing-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/pricing-service
ENV PORT=3013
EXPOSE 3013
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3013/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
