FROM node:20-slim AS deps
WORKDIR /app
RUN corepack enable && yarn config set nodeLinker node-modules
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN yarn install --immutable

FROM node:20-slim AS release
WORKDIR /app
#ENV NODE_ENV=production
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY package.json yarn.lock .yarnrc.yml ./
COPY server ./server
WORKDIR /app/server
EXPOSE 3000
CMD [ "sh", "-c", "yarn db:push && yarn db:seed && yarn server:start" ]
