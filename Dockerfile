# Use Node.js 20 LTS
FROM node:20-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN yarn db:generate

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Expose port (Railway will override this)
EXPOSE 3001

# Start the application with migrations
CMD ["yarn", "deploy"]