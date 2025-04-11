# Build stage
FROM node:slim AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --no-audit && \
    npm cache clean --force

# Copy the rest of the code
COPY . .

# Build the application with increased memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Production stage
FROM node:slim

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install only production dependencies plus required packages
RUN npm ci --only=production --no-audit --no-optional && \
    npm install --save class-validator class-transformer && \
    npm cache clean --force

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/.ebextensions ./.ebextensions

# Expose the port the app runs on
EXPOSE 3000

# Use dumb-init as the entry point
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application
CMD ["node", "dist/src/main.js"]
