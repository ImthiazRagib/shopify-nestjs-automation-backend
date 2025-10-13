# Use Node.js 20 Alpine as base image for smaller size
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Development stage
FROM base AS development
WORKDIR /app

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["yarn", "start:dev"]

# Build stage
FROM base AS build
WORKDIR /app

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Install only production dependencies
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/views ./views

# Change ownership to non-root user
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start production server
CMD ["node", "dist/main.js"]
