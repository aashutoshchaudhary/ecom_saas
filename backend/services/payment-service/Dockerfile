FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/payment-service ./services/payment-service
RUN cd services/payment-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/payment-service && npm install
RUN cd services/payment-service && npx prisma generate || true
RUN cd services/payment-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/payment-service/package.json ./services/payment-service/
RUN cd services/payment-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/payment-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/payment-service/dist ./services/payment-service/dist
COPY --from=build /app/services/payment-service/prisma ./services/payment-service/prisma
COPY --from=build /app/services/payment-service/node_modules/.prisma ./services/payment-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/payment-service
ENV PORT=3015
EXPOSE 3015
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3015/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
