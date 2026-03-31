FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/role-service ./services/role-service
RUN cd services/role-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/role-service && npm install
RUN cd services/role-service && npx prisma generate || true
RUN cd services/role-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/role-service/package.json ./services/role-service/
RUN cd services/role-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/role-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/role-service/dist ./services/role-service/dist
COPY --from=build /app/services/role-service/prisma ./services/role-service/prisma
COPY --from=build /app/services/role-service/node_modules/.prisma ./services/role-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/role-service
ENV PORT=3003
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3003/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
