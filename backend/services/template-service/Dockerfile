FROM node:20-alpine AS build
WORKDIR /app

# Copy and build shared package
COPY shared ./shared
RUN cd shared && npm install && npx tsc || true

# Copy and build service
COPY services/template-service ./services/template-service
RUN cd services/template-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/template-service && npm install
RUN cd services/template-service && npx prisma generate || true
RUN cd services/template-service && npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache dumb-init curl &&     addgroup -g 1001 -S appgroup &&     adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

# Copy shared built output
COPY --from=build /app/shared ./shared

# Install prod deps for service
COPY services/template-service/package.json ./services/template-service/
RUN cd services/template-service && sed -i 's|"workspace:\*"|"file:../../shared"|g' package.json
RUN cd services/template-service && npm install --omit=dev

# Copy compiled code
COPY --from=build /app/services/template-service/dist ./services/template-service/dist
COPY --from=build /app/services/template-service/prisma ./services/template-service/prisma
COPY --from=build /app/services/template-service/node_modules/.prisma ./services/template-service/node_modules/.prisma

USER appuser
WORKDIR /app/services/template-service
ENV PORT=3007
EXPOSE 3007
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD curl -f http://localhost:3007/health || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
