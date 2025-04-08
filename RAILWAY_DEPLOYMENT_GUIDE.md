# Railway Deployment Guide for Chess Club Application

## Issue: Java/Gradle Misdetection

Railway's auto-detection system is incorrectly identifying this project as a Java/Gradle application due to the presence of Android files in the repository. This guide provides solutions to this problem.

## Solution 1: Use the Current Repository with Fixes

These files have been added to prevent Java/Gradle detection:

1. `.railwayignore` - Tells Railway to ignore Android/Java files
2. `.dockerignore` - Similar to .railwayignore for Docker builds
3. `.node-version` and `.nvmrc` - Explicitly identify this as a Node.js project
4. `railway.json` - Configured to use NIXPACKS instead of Dockerfile
5. `package.json.railway` - A template package.json file that identifies this as a Node.js project and can be renamed to package.json during deployment

### Deployment Steps

1. Push these changes to your repository
2. In Railway dashboard, create a new project
3. Select "Deploy from GitHub repo"
4. Select your repository
5. Railway should now recognize it as a Node.js project and deploy correctly

## Solution 2: Create a Clean Deployment Branch

If Solution 1 doesn't work, create a clean branch without Android files by removing all Android-related files and directories, then push this branch to GitHub and deploy from it.

## Solution 3: Separate Repository

As a last resort, create a new repository with only the Node.js project files and deploy from it.

## Environment Variables

Make sure to set these in Railway:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Set to 3000 (or leave empty to let Railway set it)
- `NODE_ENV` - Set to "production"

## Troubleshooting

If you still encounter issues:

1. Check Railway logs to see what builder is being used
2. Try adding more Node.js specific files like `package-lock.json`
3. Contact Railway support mentioning the Java/Gradle misdetection issue

## Once Deployed

After successful deployment:

1. Verify the application is running by checking logs
2. Test all functionality to ensure it works in the production environment
3. Set up the custom domain if needed
