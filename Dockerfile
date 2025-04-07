FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install express@4.18.3 --save
RUN npm install

# Copy web package files and install frontend dependencies
COPY web/package*.json ./web/
WORKDIR /app/web
RUN npm install
WORKDIR /app

# Create .dockerignore file on the fly to exclude Android app files
RUN echo "app/" > .dockerignore && \
    echo "*.java" >> .dockerignore && \
    echo "*.gradle" >> .dockerignore && \
    echo "gradlew*" >> .dockerignore

# Copy the rest of the application code (excluding Android app files)
COPY . .

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