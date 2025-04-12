FROM node:20-slim

# Enable Corepack for Yarn 4
RUN corepack enable && yarn config set nodeLinker node-modules

WORKDIR /app

# Copy package files first
COPY package.json yarn.lock ./

# Install dependencies (including dev for tsx)
RUN yarn install

# Copy the rest of the source
COPY . .

# Expose Fastify port
EXPOSE 3000

# Run dev mode using tsx (no build needed)
CMD ["yarn", "dev"]
