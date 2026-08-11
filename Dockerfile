# Use Node 20 / 24 LTS Alpine image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Build Vite frontend bundle
RUN npm run build

# Expose server port
EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

# Start server
CMD ["node", "server.js"]
