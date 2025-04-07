# Golden Knight Chess Club - Render Deployment Guide

This guide provides step-by-step instructions for deploying the Golden Knight Chess Club application to Render.com.

## Prerequisites

- A GitHub account with your repository pushed
- A Render.com account (create one at https://render.com if needed)

## Option 1: Deploy Using the render.yaml (Blueprint)

The simplest way to deploy is to use the render.yaml file, which acts as a blueprint for your entire infrastructure.

1. Log in to your Render dashboard
2. Click on the "New" button and select "Blueprint"
3. Connect your GitHub repository if not already connected
4. Select the repository containing the chess club application
5. Render will detect the render.yaml file and create both:
   - A PostgreSQL database service (chess_db)
   - A web service (web) connected to that database
6. Review the configuration and click "Apply"
7. Render will provision all services automatically
8. Once deployed, initialize the database schema:
   - From your Render dashboard, open your web service
   - Go to the "Shell" tab
   - Run: `node db-push.js`
   - If you want sample data in production, run: `NODE_ENV=production node server/seed.js`

## Option 2: Manual Deployment

If you prefer manual control over the deployment process, follow these steps:

### Step 1: Create a PostgreSQL Database on Render

1. Log in to your Render dashboard
2. Click on "New" and select "PostgreSQL"
3. Configure your PostgreSQL service:
   - Name: `golden-knight-chess-db`
   - Database: `chess_club`
   - User: `chess_admin` (or let Render generate one automatically)
   - Region: (Choose the one closest to your users)
4. Click "Create Database"
5. Once created, make note of the following information:
   - **Internal Database URL** (important for connecting from your web service)

### Step 2: Create a Web Service for Your Application

1. From your Render dashboard, click "New" and select "Web Service"
2. Connect your GitHub repository or provide the repository URL
3. Configure your web service with these settings:
   - Name: `golden-knight-chess-club`
   - Region: (Same as your database for best performance)
   - Branch: `main` (or your default branch)
   - Runtime: `Node`
   - Build Command: `npm install express@4.18.3 --save && npm install && cd web && npm install && npm run build`
   - Start Command: `node server/index.js`

### Step 3: Configure Environment Variables

1. In your web service settings, navigate to the "Environment" tab
2. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (paste your Internal Database URL from Step 1)
   - `PORT`: `10000` (Render uses port 10000 by default)

### Step 4: Initialize the Database

After your application is deployed, you need to initialize the database schema:

1. From your Render dashboard, open your web service
2. Go to the "Shell" tab
3. Run the database push command: `node db-push.js`
4. If you want to seed the database with initial data, you can run: `NODE_ENV=production node server/seed.js`

## Verify Your Deployment

1. Visit your application URL (https://golden-knight-chess-club.onrender.com)
2. Test the following features to ensure everything is working correctly:
   - User login (Admin/1234)
   - Rankings page
   - Game submission
   - Real-time updates via WebSocket
   - Admin features

## Troubleshooting Common Issues

### Express Version Issues

If you encounter an error like:
```
TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError
    at name (/opt/render/project/src/node_modules/path-to-regexp/dist/index.js:73:19)
```

This is due to a compatibility issue between Express 5.1.0 and path-to-regexp. The solution is:

1. Downgrade Express to version 4.18.3 by using this build command:
   ```
   npm install express@4.18.3 --save && npm install && cd web && npm install && npm run build
   ```
2. Or update your package.json to specify Express 4.18.3 before deploying

### WebSocket Connection Problems

If WebSocket connections are failing in production:

1. Ensure your frontend code correctly uses secure WebSocket protocol (wss://) for HTTPS connections
2. Verify that your WebSocket server path (/ws) is configured consistently in both frontend and backend
3. Check Render logs for any WebSocket-related errors

### Database Connection Issues

If your application can't connect to the database:

1. Double-check that the DATABASE_URL environment variable is set correctly
2. Ensure your IP is allowed in Render's database access controls
3. Verify that the database service is up and running

### CORS Issues

If you're seeing CORS errors in the browser console:

1. Check that your CORS configuration in server/index.js includes your Render domain
2. Ensure your WebSocket connections are using the correct protocol based on whether the site is using HTTPS

## Maintenance Tasks

### Database Backups

1. Render automatically creates daily backups of your PostgreSQL database
2. You can create manual backups from the database dashboard

### Monitoring

1. Use Render's built-in logs and metrics to monitor application health
2. Set up alerts for critical errors through Render's notification settings

## Further Support

For Render-specific issues, refer to their documentation at https://render.com/docs