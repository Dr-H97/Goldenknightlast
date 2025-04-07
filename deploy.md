# Golden Knight Chess Club - Railway Deployment Guide

This comprehensive guide outlines the steps to deploy the Golden Knight Chess Club application to Railway.

## Prerequisites

1. You need a [Railway](https://railway.app/) account
2. Git repository with your code (GitHub recommended for seamless integration)
3. A PostgreSQL database (can be provisioned on Railway)

## Files Created/Modified for Railway Deployment

We've already prepared the following files in your project:

1. `railway.json` - Configuration file for Railway deployment
2. `Procfile` - Specifies the command to run the application
3. `.env.example` - Example environment variables file
4. `server/middleware/auth.js` - Authentication middleware
5. Updated WebSocket configuration in `web/src/utils/websocket.js`
6. Updated CORS settings in `server/index.js`
7. Enhanced Vite configuration in `web/vite.config.js`

## Setup Scripts

Add these scripts to your package.json (will be needed for Railway):

```json
"scripts": {
  "dev": "concurrently \"nodemon server/index.js\" \"cd web && npm run dev\"",
  "build": "cd web && npm run build",
  "start": "node server/index.js",
  "db:push": "node db-push.js",
  "db:generate": "node db-generate.js"
}
```

## Deployment Steps

### 1. Create a new Railway Project

1. Log in to your Railway account
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub repository
5. Select the repository containing your Chess Club app

### 2. Add a PostgreSQL Database Service

1. In your Railway project, click "New Service"
2. Select "Database" > "PostgreSQL"
3. Wait for the database to be provisioned

### 3. Connect Database to Your App

The database connection string will be automatically added to your application as an environment variable `DATABASE_URL`.

### 4. Configure Environment Variables

Add the following environment variables in your Railway project settings:
- `NODE_ENV`: Set to `production`
- `SESSION_SECRET`: A secure random string for session encryption

### 5. Deploy the Application

Railway will automatically:
1. Detect the Node.js application
2. Install dependencies
3. Build the application using your railway.json configuration
4. Start the application with the Procfile

Your application should be deployed and accessible via the Railway-provided URL.

## Post-Deployment

### Database Migration

After your application is deployed, you may need to push your database schema:

1. Connect to the Railway CLI:
```
railway login
railway link
```

2. Run the database migration:
```
railway run npm run db:push
```

### Monitoring

Monitor your application logs and performance from the Railway dashboard to ensure everything is working correctly.

### Custom Domain (Optional)

You can configure a custom domain for your project through the Railway dashboard:
1. Go to your project settings
2. Navigate to the "Domains" section
3. Add your custom domain
4. Update DNS settings as instructed by Railway