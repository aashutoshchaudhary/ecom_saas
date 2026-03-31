FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/plugin-service ./services/plugin-service
RUN cd services/plugin-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/plugin-service && npm install
RUN cd services/plugin-service && npx prisma generate || true
RUN cd services/plugin-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/plugin-service/package.json ./services/plugin-service/
RUN cd services/plugin-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/plugin-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/plugin-service/dist ./services/plugin-service/dist
COPY --from=build /app/services/plugin-service/prisma ./services/plugin-service/prisma
COPY --from=build /app/services/plugin-service/node_modules/.prisma ./services/plugin-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/plugin-service
ENV PORT=3018
EXPOSE 3018
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3018/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
