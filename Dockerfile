# Chess Club Web Application - THIS IS A NODE.JS PROJECT (NOT Java/Gradle)
FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy web package files and install frontend dependencies
COPY web/package*.json ./web/
WORKDIR /app/web
RUN npm install
WORKDIR /app

# Copy only Node.js project files (explicitly avoiding Java/Android files)
COPY server/ ./server/
COPY web/src/ ./web/src/
COPY web/public/ ./web/public/
COPY web/index.html ./web/
COPY web/vite.config.js ./web/
COPY shared/ ./shared/
COPY .dockerignore ./
COPY .railwayignore ./
COPY railway.json ./

# Build the frontend
WORKDIR /app/web
RUN npm run build
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]