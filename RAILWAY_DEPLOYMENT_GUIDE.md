# Railway Deployment Guide

This guide provides instructions for deploying the Chess Club application to Railway.

## Files Added to Fix Gradle Detection Issue

1. **`.railwayignore`** - Prevents Railway from detecting and processing Android/Java files
2. **`railway.json`** - Uses NIXPACKS instead of Dockerfile for more reliable Node.js detection

## Deployment Steps

1. Push your code to GitHub with these files included
2. Log in to [Railway](https://railway.app/)
3. Create a new project
4. Connect to your GitHub repository
5. Add the PostgreSQL plugin
6. Configure environment variables:
   - `NODE_ENV`: `production`
   - `SESSION_SECRET`: A random string for session encryption
7. Deploy the application

## Alternative Solution (If Issues Persist)

If you continue to have issues with Railway detecting your project as Java/Gradle:

1. Create a new branch in your local Git repository
2. Remove all Android-related files and directories from this branch:
   - `app/` directory
   - Any `.java` files
   - Any `.gradle` files
   - `gradlew` files
   - `build.gradle`
   - `settings.gradle`
3. Push this clean branch to GitHub 
4. Deploy the clean branch on Railway

## Checking Deployment Status

Once deployed, you should be able to access your application at the provided Railway URL and verify that:

1. The API endpoints are functioning correctly
2. The database is properly connected
3. The frontend is rendered properly

## Troubleshooting

If you continue to experience Java/Gradle detection issues:

1. Check the Railway build logs for specific error messages
2. Consider using Railway CLI for more direct control over deployment
3. Contact Railway support through their Discord server or documentation
