# Deployment Guide for Golden Knight Chess Club

This guide provides instructions for deploying your Chess Club application on either Render or Railway platforms.

## Option 1: Deploying on Render

Render is a unified platform that makes it easy to build and run all your apps and websites with free TLS certificates, global CDN, and auto deploys from Git.

### Step 1: Prepare Your Application

1. Make sure your application has the following structure:
   - Frontend (Vite React) in the `/web` directory
   - Backend (Express) in the `/server` directory
   - PostgreSQL database for storage

2. Create a `Procfile` in the root of your project:
   ```
   web: node server/index.js
   ```

### Step 2: Sign Up for Render

1. Go to [render.com](https://render.com) and sign up for an account
2. Connect your GitHub/GitLab repository to Render

### Step 3: Create a PostgreSQL Database on Render

1. On your Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Name your database (e.g., "chess-club-db")
4. Choose a plan (Free or Starter)
5. Click "Create Database"
6. Once created, note the "Internal Database URL" - you'll need this for your web service

### Step 4: Deploy Your Web Service

1. On your Render dashboard, click "New +"
2. Select "Web Service"
3. Connect your repository
4. Enter the following details:
   - Name: `golden-knight-chess-club`
   - Build Command: `npm install && cd web && npm install && npm run build`
   - Start Command: `node server/index.js`
   - Set the following environment variables:
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: (paste the Internal Database URL from Step 3)
5. Click "Create Web Service"

Your application will now be deployed and available at the URL provided by Render!

## Option 2: Deploying on Railway

Railway is a deployment platform where you can provision infrastructure, develop with that infrastructure locally, and then deploy to the cloud.

### Step 1: Prepare Your Application

Ensure your application is set up as described in Option 1, Step 1.

### Step 2: Sign Up for Railway

1. Go to [railway.app](https://railway.app) and sign up for an account
2. Connect your GitHub repository to Railway

### Step 3: Create a New Project

1. On your Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway will automatically detect your Node.js application

### Step 4: Add a PostgreSQL Database

1. In your project, click "New Service"
2. Select "Database" and then "PostgreSQL"
3. Wait for the database to be provisioned

### Step 5: Configure Your Web Service

1. Click on your deployed web service
2. Go to the "Variables" tab
3. Set the following environment variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - Railway will automatically inject the DATABASE_URL
4. Go to the "Settings" tab
5. Under "Build" settings:
   - Build Command: `npm install && cd web && npm install && npm run build`
   - Start Command: `node server/index.js`

### Step 6: Deploy Your Application

1. Railway will automatically trigger a deployment when you push changes to your repository
2. Once deployed, click on the "Generate Domain" button to get a public URL

Your Chess Club application is now deployed on Railway!

## Optional: Custom Domain Setup

For both Render and Railway, you can set up a custom domain:

1. Purchase a domain name from a provider like Namecheap, GoDaddy, or Google Domains
2. In your hosting platform (Render or Railway):
   - Go to your web service's settings
   - Find the "Custom Domain" section
   - Add your domain name
3. Configure DNS settings at your domain provider by adding the required records (usually CNAME)
4. Wait for DNS propagation (can take up to 48 hours)

Your app will then be accessible via your custom domain with automatic HTTPS!

## Common Issues and Troubleshooting

### Database Migration Issues
- Make sure your database migration scripts run properly during deployment
- You may need to add a build step that runs `npm run db:push`

### WebSocket Connection Problems
- Ensure your WebSocket client code uses the correct protocol (ws:// or wss://)
- Dynamic WebSocket URL based on production/development:
  ```javascript
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  ```

### CORS Issues
- Your server's CORS configuration should allow requests from your deployed frontend domain

### Environment Variables
- Double-check all required environment variables are set in your deployment platform
- Sensitive data like API keys should be stored as environment variables, not in your code

For any other issues, consult the documentation of your chosen deployment platform or reach out to their support team.