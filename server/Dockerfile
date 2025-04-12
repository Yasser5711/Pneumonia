FROM node:20-slim

# Enable Corepack and configure Yarn 4
RUN corepack enable && yarn config set nodeLinker node-modules

# Create app directory
WORKDIR /app

# Copy core Yarn files first (for all workspaces)
COPY .yarn .yarn
COPY .yarnrc.yml .yarnrc.yml
COPY package.json yarn.lock ./

# Copy only server workspace package.json
COPY server/package.json ./server/package.json

# Install dependencies with Yarn 4 workspaces (resolves all workspaces)
RUN yarn install --inline-builds

# Copy the full monorepo (needed to build/run server workspace)
COPY . .

# Set working dir to server workspace
WORKDIR /app/server

# Expose Fastify port
EXPOSE 3000

# Run server in dev mode
CMD ["yarn", "dev"]
