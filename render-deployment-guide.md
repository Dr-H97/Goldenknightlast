# Golden Knight Chess Club - Render Deployment Guide

This guide provides detailed steps for deploying the Golden Knight Chess Club application on Render.

## Step 1: Create a PostgreSQL Database on Render
1. Log in to your Render dashboard at https://dashboard.render.com
2. Click on "New" and select "PostgreSQL"
3. Configure your database:
   - Name: `chess-club-db`
   - Database Name: `chess_club`
   - User: `chess_club_user`
   - Region: Choose the one closest to your users
   - Plan: Free or paid tier as needed
4. Click "Create Database"
5. Once created, copy the Internal Database URL

## Step 2: Create a Web Service
1. From your Render dashboard, click "New" and select "Web Service"
2. Connect to your GitHub repository
3. Configure the service:
   - Name: `golden-knight-chess-club`
   - Environment: Node
   - Region: Same as your database
   - Build Command: `npm install && cd web && npm install && npm run build`
   - Start Command: `node server/index.js`
   - Plan: Free or paid tier as needed

## Step 3: Configure Environment Variables
1. In your Web Service settings, go to the "Environment" tab
2. Add the following variables:
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: (paste the Internal Database URL from Step 1)
   - `PORT`: `10000` (Render default)
   - `JWT_SECRET`: (generate a secure random string)

## Step 4: Deploy Your Application
1. Click "Create Web Service"
2. Render will automatically start the build and deployment process
3. Monitor the progress in the "Events" tab

## Step 5: Initialize Database
1. After deployment completes, open the "Shell" tab in your Web Service
2. Run database migrations: `node db-push.js`

## Step 6: Verify Your Deployment
1. Go to your application URL (provided by Render)
2. Test all functionality:
   - Login with Admin/1234
   - View Rankings
   - Submit Games
   - Use Admin features
   - Verify WebSocket functionality for real-time updates

## Troubleshooting
- If WebSocket connections fail, verify your client connection URL
- For database issues, check connection string and service status
- For static file issues, ensure build process completed successfully

## Optimizations
- Configure auto-scaling for high traffic periods
- Set up regular database backups
- Add a custom domain for your application
- Configure SSL certificates for your domain
