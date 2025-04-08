# Chess Club App - Simplified Deployment Guide

This guide will walk you through deploying your Chess Club application using completely free services.

## Overview

The application now uses:
- Firebase for authentication and database (free tier)
- Vercel for frontend hosting (free tier)

No server backend is needed as we've migrated all functionality to Firebase!

## Step 1: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
   - Name it "Chess Club" or whatever you prefer
   - Enable Google Analytics if you want (optional)

2. Set up Firebase Authentication:
   - In Firebase console, go to "Authentication" → "Sign-in method"
   - Enable "Anonymous" authentication (for PIN-based login)

3. Set up Firestore Database:
   - In Firebase console, go to "Firestore Database"
   - Click "Create database"
   - Start in test mode (we'll secure it later)

4. Get your Firebase configuration:
   - In Firebase console, go to "Project settings" (gear icon)
   - Scroll down to "Your apps" section
   - Click the "</>" icon to add a Web app
   - Register the app with a name like "Chess Club Web"
   - Copy the firebase configuration values:
     - apiKey
     - projectId
     - appId

## Step 2: Deploy Frontend to Vercel

1. Create a [Vercel account](https://vercel.com/signup) (free)

2. Push your code to GitHub:
   - Create a new GitHub repository
   - Push your code to this repository

3. Import your repository in Vercel:
   - On Vercel dashboard, click "Add New..." → "Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: Vite
     - Root Directory: web (since our frontend is in the web folder)
     - Build Command: npm run build
     - Output Directory: dist

4. Set up environment variables:
   - Add your Firebase configuration variables:
     - VITE_FIREBASE_API_KEY
     - VITE_FIREBASE_PROJECT_ID
     - VITE_FIREBASE_APP_ID
   
5. Deploy:
   - Click "Deploy"
   - Wait for deployment to complete

6. Visit your deployed app:
   - Click the deployment URL to see your live app
   - The URL will be something like: chess-club.vercel.app

## Step 3: Secure Your Firebase Project

Now that your app is deployed, secure your Firebase project:

1. Set up Firestore security rules:
   - Go to Firestore Database → Rules
   - Update rules to:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read all player data
       match /players/{playerId} {
         allow read: if request.auth != null;
         // Only allow admins to write player data
         allow write: if request.auth != null && 
                      exists(/databases/$(database)/documents/players/$(request.auth.uid)) && 
                      get(/databases/$(database)/documents/players/$(request.auth.uid)).data.is_admin == true;
       }
       
       // Allow authenticated users to read all games
       match /games/{gameId} {
         allow read: if request.auth != null;
         // Allow authenticated users to create games
         allow create: if request.auth != null;
         // Only allow admins to update or delete games
         allow update, delete: if request.auth != null && 
                              exists(/databases/$(database)/documents/players/$(request.auth.uid)) && 
                              get(/databases/$(database)/documents/players/$(request.auth.uid)).data.is_admin == true;
       }
     }
   }
   ```

2. Add Authentication domain:
   - Go to Authentication → Settings
   - Add your Vercel domain to "Authorized domains"

## Step 4: Set Up Initial Club Data

You have two options:

### Option 1: Use the app's initialization function
1. Visit your deployed app and login with Admin/1234
2. The initialization will run automatically on first use

### Option 2: Manually add data through Firebase Console
1. Go to Firestore Database
2. Create collections for 'players' and 'games'
3. Add initial player documents

## Congratulations!

Your Chess Club app is now deployed with:
- Free database and authentication (Firebase)
- Free frontend hosting (Vercel)
- No server to maintain
- Easy to update

## Maintenance

To update your app:
1. Make changes to your code locally
2. Push to GitHub
3. Vercel will automatically redeploy

## Troubleshooting

- **Authentication issues**: Check Firebase authentication settings
- **Database access denied**: Verify Firestore security rules
- **App not updating**: Make sure your GitHub repository is connected to Vercel and automatic deployments are enabled