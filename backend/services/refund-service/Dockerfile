FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/refund-service ./services/refund-service
RUN cd services/refund-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/refund-service && npm install
RUN cd services/refund-service && npx prisma generate || true
RUN cd services/refund-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/refund-service/package.json ./services/refund-service/
RUN cd services/refund-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/refund-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/refund-service/dist ./services/refund-service/dist
COPY --from=build /app/services/refund-service/prisma ./services/refund-service/prisma
COPY --from=build /app/services/refund-service/node_modules/.prisma ./services/refund-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/refund-service
ENV PORT=3016
EXPOSE 3016
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3016/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
