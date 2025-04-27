FROM node:20-slim

RUN corepack enable && yarn config set nodeLinker node-modules

WORKDIR /app

COPY package.json yarn.lock .yarn .yarnrc.yml ./
COPY server ./server

RUN yarn install --inline-builds

WORKDIR /app/server
EXPOSE 3000

CMD ["yarn", "server:dev"]
