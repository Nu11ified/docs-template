FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS build
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM base AS runtime
COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/.cache ./.cache
COPY --from=build /app/public ./public
COPY --from=build /app/src ./src
COPY --from=build /app/content ./content
COPY --from=build /app/site.yaml ./site.yaml
COPY --from=build /app/package.json ./package.json

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "start"]
