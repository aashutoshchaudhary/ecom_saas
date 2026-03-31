FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/industry-service ./services/industry-service
RUN cd services/industry-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/industry-service && npm install
RUN cd services/industry-service && npx prisma generate || true
RUN cd services/industry-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/industry-service/package.json ./services/industry-service/
RUN cd services/industry-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/industry-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/industry-service/dist ./services/industry-service/dist
COPY --from=build /app/services/industry-service/prisma ./services/industry-service/prisma
COPY --from=build /app/services/industry-service/node_modules/.prisma ./services/industry-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/industry-service
ENV PORT=3005
EXPOSE 3005
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3005/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
