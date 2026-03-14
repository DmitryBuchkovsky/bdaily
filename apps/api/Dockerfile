FROM node:20-alpine AS build

RUN corepack enable
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --frozen-lockfile

COPY packages/shared packages/shared
COPY apps/api apps/api
COPY tsconfig.base.json tsconfig.base.json

RUN pnpm --filter @bdaily/shared build 2>/dev/null || true
RUN pnpm --filter @bdaily/api exec prisma generate
RUN pnpm --filter @bdaily/api build

FROM node:20-alpine AS runtime

RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
WORKDIR /app

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/node_modules apps/api/node_modules
COPY --from=build /app/apps/api/package.json apps/api/package.json
COPY --from=build /app/apps/api/prisma apps/api/prisma

RUN mkdir -p /app/uploads && chown appuser:appgroup /app/uploads

ENV NODE_ENV=production
USER appuser
EXPOSE 8091

CMD ["node", "apps/api/dist/index.js"]
