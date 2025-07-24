# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN yarn db:generate

# Build the application
RUN yarn build

# Expose port
EXPOSE 3001

# Start the application
CMD ["yarn", "start"]