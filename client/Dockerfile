FROM node:20-slim

# Enable Corepack and Yarn 4
RUN corepack enable && yarn config set nodeLinker node-modules

# Set working dir
WORKDIR /app

# Copy root monorepo configs
COPY package.json yarn.lock .yarn .yarnrc.yml ./

# Copy only client workspace
COPY client ./client

# Install only client deps
RUN yarn install --inline-builds

WORKDIR /app/client
EXPOSE 4000

CMD ["yarn", "dev"]
