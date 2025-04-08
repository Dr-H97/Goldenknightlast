# Golden Knight Chess Club - Railway Deployment Guide

This guide will help you deploy your Chess Club application to Railway.com quickly and efficiently.

## Prerequisites

1. A GitHub account with your Chess Club repository
2. A Railway.com account (sign up at https://railway.app if you don't have one)
3. You've pushed your code to your GitHub repository

## Step 1: Connect Your Repository

1. Log in to your Railway dashboard
2. Click "New Project" 
3. Select "Deploy from GitHub repo"
4. Choose your Chess Club repository from the list
5. Once connected, Railway will automatically detect your Node.js project

## Step 2: Configure Your Project

1. In the Railway dashboard, go to your newly created project
2. Click on the "Variables" tab
3. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (add a secure random string)
   - `PORT`: `3000` (Railway automatically exposes this port)

## Step 3: Add a Database Service

1. In your project dashboard, click "New" → "Database"
2. Select "PostgreSQL"
3. Railway will provision a PostgreSQL database
4. Railway will automatically add the `DATABASE_URL` environment variable to your project

## Step 4: Deploy Your Application

1. After the database is provisioned, go back to your service
2. Railway will automatically detect your package.json and start the deployment
3. The deployment should automatically run:
   - `npm install`
   - `cd web && npm install && npm run build`
   - `node server/index.js`

## Step 5: Initialize the Database

1. In the Railway dashboard, go to your application
2. Click on "Settings" → "Shell"
3. In the shell, run: `node db-push.js`
4. This will set up your database schema and apply migrations

## Step 6: Test Your Deployment

1. In the Railway dashboard, find the URL of your deployment (e.g., https://your-app-name.up.railway.app)
2. Open the URL in your browser
3. Test your application by logging in with Admin/1234
4. Check all functionality:
   - Rankings
   - Game submission
   - Admin features
   - WebSocket real-time updates

## Troubleshooting

### Database Connection Issues

If your application isn't connecting to the database:
1. Check that the `DATABASE_URL` environment variable is properly set
2. Ensure your database service is running
3. Run `node db-push.js` to make sure the schema is properly initialized

### Build/Deployment Issues

If your deployment is failing:
1. Check the deployment logs in the Railway dashboard
2. Ensure your `package.json` has the correct scripts
3. Make sure your `Procfile` contains: `web: node server/index.js`

### CORS or WebSocket Issues

If you're having CORS or WebSocket connection problems:
1. Update the CORS configuration in server/index.js to include your Railway domain
2. Ensure the WebSocket URL is dynamically generated based on the current domain

## Custom Domain (Optional)

1. In the Railway dashboard, go to your deployment
2. Click on "Settings" → "Domains"
3. Add your custom domain and follow the DNS configuration instructions

## Auto-deployment

Railway automatically redeploys your application when you push changes to your GitHub repository. No additional configuration is needed.

## Best Practices

1. Always test your application locally before deploying
2. Use environment variables for all configuration (never hardcode values)
3. Keep your JWT_SECRET secure and use a strong random value
4. Regularly back up your database
5. Monitor application logs in the Railway dashboard