# Simplified Deployment Guide

This guide provides instructions for deploying the Chess Club Management app in different environments.

## Option 1: Vercel Deployment (Recommended, Free)

1. **Fork or Clone the Repository**
   - Fork this repository to your GitHub account or clone it and push to your own repository

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com) and sign up for a free account
   - Click "Add New Project"
   - Import your repository
   - Configure the project:
     - Framework Preset: Vite
     - Root Directory: `web`
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Environment Variables**
   If you want to use Firebase (optional):
   - Add the following environment variables in Vercel's project settings:
     ```
     VITE_FIREBASE_API_KEY=your-api-key
     VITE_FIREBASE_PROJECT_ID=your-project-id
     VITE_FIREBASE_APP_ID=your-app-id
     VITE_USE_MOCK_DATA=false
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Once complete, you'll get a URL to access your application

## Option 2: Firebase Hosting (Free with Limits)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase in the Project**
   ```bash
   cd web
   firebase init
   ```
   - Select Hosting
   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys: No

4. **Build the Project**
   ```bash
   npm run build
   ```

5. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

## Option 3: Manual Deployment on Any Server

1. **Build the App**
   ```bash
   cd web
   npm run build
   ```

2. **Deploy the Build**
   - Copy the contents of the `dist` folder to your web server's root directory
   - Configure your web server to serve index.html for all routes (for SPA support)
   - Example configuration for Nginx:
     ```nginx
     server {
         listen 80;
         server_name your-domain.com;
         root /path/to/dist;
         index index.html;
         
         location / {
             try_files $uri $uri/ /index.html;
         }
     }
     ```

## Option 4: Replit Deployment

1. **Create a New Repl**
   - Go to [Replit](https://replit.com)
   - Create a new Repl from GitHub
   - Import your repository

2. **Configure the Repl**
   - In the `.replit` file, make sure it's configured to start the web application
   - Update the run command to:
     ```
     cd web && npm install && npm start
     ```

3. **Environment Variables**
   - Go to the Secrets tab in your Repl
   - Add your Firebase config if you want to use Firebase, or set VITE_USE_MOCK_DATA to true

4. **Deploy**
   - Click on the "Deploy" button in the Replit interface
   - You'll get a URL for your deployed application

## Accessing the Demo Application

For testing without real Firebase:
- Use the username "Admin" and PIN "1234" to log in as administrator
- Other test users include "Alice", "Bob", "Carol", "Dave", and "Eve" (all with PIN "1111")

## Firebase Configuration (Optional)

If you want to use real Firebase instead of the demo mode:

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Add a web app to your Firebase project
3. Enable Authentication with Anonymous sign-in
4. Create a Firestore database
5. Get your Firebase configuration (apiKey, projectId, appId)
6. Update the environment variables in your deployment platform
7. Import sample data using the instructions in FIREBASE_IMPORT_GUIDE.md
8. Set VITE_USE_MOCK_DATA to false

## Troubleshooting

- **Application not loading**: Check browser console for errors
- **API errors**: Ensure Firebase is properly configured if not using mock data
- **Page not found errors**: Ensure your server is configured to handle SPA routing
- **Login issues**: Make sure you're using the correct PIN codes (1234 for Admin, 1111 for other test users)

For any other issues, consult the project's documentation or open an issue on GitHub.