# Vercel Deployment Guide with Firebase Authentication

This guide describes how to deploy the Chess Club application using Vercel for the frontend and Firebase for authentication.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- A Firebase account and project (create at [console.firebase.google.com](https://console.firebase.google.com))

## Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (or use an existing one).

2. In your Firebase project, click "Add app" and select the Web platform (`</>`).

3. Register your app with a nickname (e.g., "Chess Club Web") and click "Register app".

4. Go to the "Authentication" section in your Firebase project and enable the Google sign-in method.

5. Add your production domain (will be from Vercel) and development domain to the "Authorized domains" list in the Firebase Authentication settings.

6. Note down the following values from your Firebase config:
   - `apiKey`
   - `projectId`
   - `appId`

## Vercel Setup

1. Fork or clone your repository to GitHub (or GitLab/BitBucket).

2. Log in to [Vercel](https://vercel.com) and click "New Project".

3. Import your repository and configure the project:
   - Framework Preset: Vite
   - Root Directory: `web` (important: select the web directory, not the root)
   - Build Command: `npm run build` (default)
   - Output Directory: `dist` (default)

4. Add Environment Variables:
   - `VITE_FIREBASE_API_KEY`: Your Firebase API key
   - `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `VITE_FIREBASE_APP_ID`: Your Firebase app ID

5. Click "Deploy"!

## After Deployment

1. Once deployed, Vercel will provide you with a domain (e.g., `your-app.vercel.app`).

2. Copy this domain and add it to the "Authorized domains" list in your Firebase Authentication settings.

3. Test your application to ensure Firebase authentication is working as expected.

## Custom Domain (Optional)

1. In your Vercel project settings, go to the "Domains" section.

2. Add your custom domain and follow the instructions to configure DNS.

3. Remember to add your custom domain to the "Authorized domains" list in Firebase Authentication settings.

## Backend Configuration

This frontend deployment assumes your backend API is already deployed and accessible. Make sure your API endpoints are properly configured in the frontend code. Your backend services should be deployed separately on a service like Railway, Heroku, or another hosting provider.

For the Chess Club application, the backend is configured in:
- `web/src/utils/api.js` - Contains the API base URL
- `web/src/utils/websocket.js` - Contains WebSocket connection settings

## Troubleshooting

- **Authentication Issues**: Ensure your domain is added to Firebase authorized domains.
- **CORS Issues**: Verify your API server allows requests from your Vercel domain.
- **Environment Variables**: Check that all required environment variables are set in Vercel.

## Maintenance

To update your application:
1. Push changes to your repository.
2. Vercel will automatically rebuild and deploy your application.

---

For additional help, refer to the [Vercel Documentation](https://vercel.com/docs) and [Firebase Documentation](https://firebase.google.com/docs).
