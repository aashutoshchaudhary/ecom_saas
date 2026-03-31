FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/user-service ./services/user-service
RUN cd services/user-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/user-service && npm install
RUN cd services/user-service && npx prisma generate || true
RUN cd services/user-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/user-service/package.json ./services/user-service/
RUN cd services/user-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/user-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/user-service/dist ./services/user-service/dist
COPY --from=build /app/services/user-service/prisma ./services/user-service/prisma
COPY --from=build /app/services/user-service/node_modules/.prisma ./services/user-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/user-service
ENV PORT=3002
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3002/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
