FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/media-service ./services/media-service
RUN cd services/media-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/media-service && npm install
RUN cd services/media-service && npx prisma generate || true
RUN cd services/media-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/media-service/package.json ./services/media-service/
RUN cd services/media-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/media-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/media-service/dist ./services/media-service/dist
COPY --from=build /app/services/media-service/prisma ./services/media-service/prisma
COPY --from=build /app/services/media-service/node_modules/.prisma ./services/media-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/media-service
ENV PORT=3025
EXPOSE 3025
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3025/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
