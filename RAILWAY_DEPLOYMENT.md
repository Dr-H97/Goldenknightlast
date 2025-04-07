# Golden Knight Chess Club - Railway Deployment Guide

This comprehensive guide provides step-by-step instructions to deploy the Golden Knight Chess Club application to Railway.

## What is Railway?

Railway is a modern deployment platform that makes it easy to deploy web applications without the hassle of managing infrastructure. It provides a fully managed PostgreSQL database service, CI/CD pipelines, and environment variables management.

## Files Already Prepared for Railway

The following files have been created or modified to ensure a smooth deployment to Railway:

1. `Dockerfile` - Contains instructions for building and running the application
2. `railway.json` - Defines the build and deployment process using Dockerfile
3. `Procfile` - Specifies the command to start the application (optional when using Dockerfile)
4. `.env.example` - Template for required environment variables
5. `server/middleware/auth.js` - Authentication middleware
6. WebSocket configurations in `web/src/utils/websocket.js` - Adapted for Railway
7. CORS settings in `server/index.js` - Updated with Railway domain
8. Enhanced Vite config in `web/vite.config.js` - Production optimizations for Railway

## Step-by-Step Deployment Guide

### Step 1: Create a Railway Account

If you don't already have one, sign up for a free account at [Railway](https://railway.app/).

### Step 2: Install the Railway CLI (Optional)

For easier management, you can install the Railway CLI:

```bash
npm i -g @railway/cli
```

### Step 3: Push Your Code to GitHub

Make sure your project is in a GitHub repository:

1. Create a new repository on GitHub
2. Push your code to the repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/golden-knight-chess-club.git
   git push -u origin main
   ```

### Step 4: Create a New Project on Railway

1. Log in to the Railway dashboard
2. Click on "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your GitHub repository
5. Select the branch you want to deploy (usually `main`)

### Step 5: Add a PostgreSQL Database

1. In your project dashboard, click "New Service"
2. Select "Database" > "PostgreSQL"
3. Wait for the database to be provisioned

### Step 6: Connect Services

Railway will automatically connect your services, but ensure that:

1. Your web service can access the database service
2. The `DATABASE_URL` environment variable is automatically populated

### Step 7: Configure Environment Variables

In your Railway dashboard:

1. Go to your web service
2. Navigate to the "Variables" tab
3. Add the following variables:
   - `NODE_ENV`: Set to `production`
   - `SESSION_SECRET`: A strong random string (you can generate one with `openssl rand -hex 32`)

### Step 8: Deploy Your Application

Railway will automatically:
1. Use the Dockerfile to build your application
2. Install dependencies and build the frontend as defined in the Dockerfile
3. Start the application using the command in the Dockerfile CMD directive
4. Monitor application health using the healthcheck endpoint defined in railway.json

### Step 9: Initialize the Database

After deployment, you'll need to run the database migration to create the tables:

```bash
railway run npm run db:push
```

Or via the dashboard:
1. Go to your web service
2. Click on the "Deploy" tab
3. Under "Custom Deploy Commands", run: `node db-push.js`

### Step 10: Access Your Deployed Application

Once the deployment is complete, you can access your application via the URL provided by Railway:

1. In the Railway dashboard, go to your web service
2. Click on the "Settings" tab
3. Find your application URL under "Domains"

## Troubleshooting Common Issues

### Database Connection Issues

If your application can't connect to the database:
1. Check that the `DATABASE_URL` environment variable is set correctly
2. Verify database credentials in the Railway dashboard
3. Ensure your app is using the correct environment variables

### WebSocket Connection Problems

If WebSocket connections fail:
1. Check browser console for connection errors
2. Verify that the WebSocket URL is correctly configured for production
3. Ensure CORS settings include your Railway domain

### Build Failures

If the build process fails:
1. Check the build logs in the Railway dashboard
2. Verify that the Dockerfile syntax is correct
3. Ensure that all dependencies are correctly listed in package.json
4. Verify your .dockerignore and .railwayignore files are correctly excluding Android/Java files

#### Handling Gradle/Java Errors

If you see errors like `ClassNotFoundException: org.gradle.wrapper.GradleWrapperMain`, this indicates Railway is incorrectly detecting the project as a Java/Gradle application due to the presence of Android app files. To fix this:

1. Make sure the .railwayignore file contains the following:
   ```
   # Android/Java files
   app/
   *.java
   *.gradle
   gradlew*
   gradle/
   build.gradle
   settings.gradle
   local.properties
   ```

2. Double-check that your railway.json explicitly specifies the DOCKERFILE builder:
   ```json
   {
     "build": {
       "builder": "DOCKERFILE",
       "dockerfilePath": "Dockerfile"
     }
   }
   ```

3. In extreme cases, you might need to temporarily remove the Android files from your repository before deployment.

## Additional Railway Features

### Automatic Deployments

Railway can automatically deploy your application whenever you push to your GitHub repository:
1. Go to your web service settings
2. Under "Deployments", ensure "Auto Deploy" is enabled

### Custom Domains

To use your own domain instead of the Railway-provided one:
1. Go to your web service settings
2. Navigate to "Domains"
3. Click "Add Domain"
4. Follow the instructions to set up DNS records

### Scale Your Application

As your user base grows, you can easily scale your application:
1. Go to your web service settings
2. Navigate to "Scaling"
3. Adjust the resources allocated to your application

## Need Help?

If you encounter any issues during deployment, refer to the [Railway documentation](https://docs.railway.app/) or reach out to Railway support.

## Account Credentials for Testing

When testing your deployed application, use these admin credentials:
- Username: "Hamza Bouzida" (ID 1)
- PIN: Test with "1234" (Note: actual PIN is hashed in the database)