FROM node:20-slim AS deps
WORKDIR /app
RUN corepack enable && yarn config set nodeLinker node-modules
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN yarn install --immutable 


FROM node:20-slim AS builder
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarn ./.yarn
COPY --from=deps /app/.yarnrc.yml ./
COPY --from=deps /app/package.json ./
COPY --from=deps /app/yarn.lock ./
COPY . .
RUN yarn workspace client build


FROM node:20-slim AS release
WORKDIR /app
# ENV NODE_ENV=production

RUN corepack enable

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/client ./client
COPY . .

WORKDIR /app/client
EXPOSE 4000
CMD ["yarn", "client:dev"]