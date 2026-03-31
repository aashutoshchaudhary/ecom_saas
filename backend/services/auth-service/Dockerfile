FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/auth-service ./services/auth-service
RUN cd services/auth-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/auth-service && npm install
RUN cd services/auth-service && npx prisma generate || true
RUN cd services/auth-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/auth-service/package.json ./services/auth-service/
RUN cd services/auth-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/auth-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/auth-service/dist ./services/auth-service/dist
COPY --from=build /app/services/auth-service/prisma ./services/auth-service/prisma
COPY --from=build /app/services/auth-service/node_modules/.prisma ./services/auth-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/auth-service
ENV PORT=3001
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3001/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
