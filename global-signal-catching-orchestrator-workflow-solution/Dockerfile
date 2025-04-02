# use --platform=linux/amd64 when build the image
FROM node:bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS prod-deps
COPY package.json /app
# COPY pnpm-lock.yaml /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --ignore-scripts

FROM base AS runner
# curl is needed to do healthcheck
RUN apt-get update && apt-get --no-install-recommends install -y curl ca-certificates
RUN update-ca-certificates
COPY ./build /app
COPY --from=prod-deps /app/node_modules /app/node_modules
RUN chown -R node:node .
USER node

ENV IS_DOCKER=true

# set our node environment
# defaults to production
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# default to port 3000 for node
ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT

ARG PROMETHEUS_PORT=9090
ENV PROMETHEUS_PORT=$PROMETHEUS_PORT
EXPOSE $PROMETHEUS_PORT

CMD ["node", "main.js"]

