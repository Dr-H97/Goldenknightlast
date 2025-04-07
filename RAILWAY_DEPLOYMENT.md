# Deploying to Railway

This document provides instructions for deploying the Chess Club application to Railway.

## Prerequisites

- A Railway account (free or paid)
- The Railway CLI (optional but recommended)

## Troubleshooting Java/Gradle Detection Issues

If you encounter an error like `ClassNotFoundException: org.gradle.wrapper.GradleWrapperMain`, Railway is incorrectly detecting your project as a Java/Gradle application due to the Android app files in your repository.

### Solution 1: Use NIXPACKS Builder with Command Override

The updated `railway.json` in this repository uses the NIXPACKS builder instead of Dockerfile, with explicit build commands:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && cd web && npm install && npm run build"
  },
  "deploy": {
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "healthcheckPath": "/api/players",
    "healthcheckTimeout": 300,
    "startCommand": "node server/index.js",
    "numReplicas": 1
  }
}
```

### Solution 2: Create a Deployment Branch (Recommended)

The most reliable solution is to create a separate deployment branch without any Android files:

1. Create a new branch in your local repository
2. Remove all Android/Java related files and directories:
   - `app/` directory
   - Any `*.gradle` files
   - `gradlew` and related files
   - `build.gradle`
   - `settings.gradle`
   - `local.properties`
3. Commit these changes and push the branch to your repository
4. In Railway, deploy from this specific branch instead of the main branch

### Solution 3: Deploy with Railway CLI

If you have the Railway CLI installed:

1. Login to Railway: `railway login`
2. Link to your project: `railway link`
3. Deploy only specific files:
   ```
   railway up --detach --filter="server/**,web/**,shared/**,package.json,railway.json"
   ```

This command explicitly defines which files to include, avoiding the Android app files altogether.

## Environment Variables

Make sure to set these environment variables in your Railway project:

- `NODE_ENV`: `production`
- `PORT`: `3000` (or let Railway assign it)
- `DATABASE_URL`: Your PostgreSQL connection string (Railway will provide this automatically if you add a PostgreSQL plugin)
- `SESSION_SECRET`: A random string for session encryption

## Database Setup

Railway offers PostgreSQL as a plugin. Simply add it to your project and Railway will automatically set up the database and provide the connection string as `DATABASE_URL`.

## Deployment Steps

1. Push your code to a GitHub repository
2. Log in to [Railway](https://railway.app/)
3. Create a new project
4. Connect to your GitHub repository
5. (Optional) Add the PostgreSQL plugin
6. Configure environment variables
7. Deploy the application

## Need Help?

If you continue to experience issues with Gradle/Java detection:

1. Contact Railway support
2. Check their documentation for troubleshooting build detection
3. Consider using Render.com as an alternative deployment platform

Remember that the deployment process assumes the web app has already been built. If you encounter errors, check your build logs carefully.