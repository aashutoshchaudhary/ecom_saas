FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/theme-service ./services/theme-service
RUN cd services/theme-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/theme-service && npm install
RUN cd services/theme-service && npx prisma generate || true
RUN cd services/theme-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/theme-service/package.json ./services/theme-service/
RUN cd services/theme-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/theme-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/theme-service/dist ./services/theme-service/dist
COPY --from=build /app/services/theme-service/prisma ./services/theme-service/prisma
COPY --from=build /app/services/theme-service/node_modules/.prisma ./services/theme-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/theme-service
ENV PORT=3008
EXPOSE 3008
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3008/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
