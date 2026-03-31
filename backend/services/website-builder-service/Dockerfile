FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/website-builder-service ./services/website-builder-service
RUN cd services/website-builder-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/website-builder-service && npm install
RUN cd services/website-builder-service && npx prisma generate || true
RUN cd services/website-builder-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/website-builder-service/package.json ./services/website-builder-service/
RUN cd services/website-builder-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/website-builder-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/website-builder-service/dist ./services/website-builder-service/dist
COPY --from=build /app/services/website-builder-service/prisma ./services/website-builder-service/prisma
COPY --from=build /app/services/website-builder-service/node_modules/.prisma ./services/website-builder-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/website-builder-service
ENV PORT=3006
EXPOSE 3006
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3006/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
