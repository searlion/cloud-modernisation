# Build stage
FROM node:20-slim AS build

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy the rest of the configuration files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY eslint.config.js ./
COPY index.html ./

# Create and copy src and public directories
COPY src/ ./src/
COPY public/ ./public/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Set environment variables for production build
ENV NODE_ENV=production

# Build the project
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy the built assets to nginx serving directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx configuration if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]