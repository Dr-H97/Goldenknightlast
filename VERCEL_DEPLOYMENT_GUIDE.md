# Vercel Deployment Guide for Chess Club Application

This guide provides step-by-step instructions for deploying the Chess Club application on Vercel (frontend) and Railway (backend). This separated approach is optimal because:

1. Vercel excels at hosting frontend applications
2. Railway is better suited for backend services and databases

## Prerequisites

- GitHub account
- Vercel account (sign up at vercel.com)
- Railway account (sign up at railway.app)

## Step 1: Prepare for Deployment

The necessary configuration files have already been created:

1. `vercel.json` - Configuration for Vercel deployment
2. `web/.env.production` - Environment variables for production
3. Updated WebSocket utility to handle cross-domain communication
4. Updated Vite configuration for Vercel

## Step 2: Deploy Backend to Railway

First, deploy the backend to Railway:

1. Push your code to a GitHub repository
2. Go to [Railway.app](https://railway.app/) and log in
3. Click "New Project" and select "Deploy from GitHub repo"
4. Select your repository
5. Set the following environment variables:
   - `DATABASE_URL` - Railway will automatically create a PostgreSQL database
   - `NODE_ENV` - Set to "production"
   - `PORT` - Railway will set this automatically, but you can set it to 3000
   - `SESSION_SECRET` - Add a strong secret for session management

6. After deployment, note the URL of your Railway app (e.g., `chess-club-backend.railway.app`)

## Step 3: Update Environment Variables

1. Update the backend URL in `web/.env.production`:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   VITE_BACKEND_WS_URL=wss://your-backend-url.railway.app/ws
   ```

2. Update the backend URL in `vercel.json` rewrites:
   ```json
   "rewrites": [
     {
       "source": "/api/:path*",
       "destination": "https://your-backend-url.railway.app/api/:path*"
     },
     {
       "source": "/ws",
       "destination": "https://your-backend-url.railway.app/ws"
     }
   ]
   ```

3. Update the WebSocket utility in `web/src/utils/websocket.js`:
   - Change `const backendHost = "chess-club-backend.railway.app"` to your actual backend URL

## Step 4: Deploy Frontend to Vercel

1. Push your updated code to GitHub
2. Go to [Vercel.com](https://vercel.com) and sign in
3. Click "Add New" > "Project"
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: Vite
   - Root Directory: ./web
   - Build Command: npm run build
   - Output Directory: dist
6. Add the environment variables from `web/.env.production`:
   - `VITE_API_URL`
   - `VITE_BACKEND_WS_URL`
7. Click "Deploy"

## Step 5: Vercel Deployment Settings

After the initial deployment, you might want to adjust some settings:

1. **Custom Domain** (optional):
   - Go to Project Settings > Domains
   - Add your custom domain (e.g., chessclub.yourdomain.com)

2. **Environment Variables**:
   - Go to Project Settings > Environment Variables
   - Verify that the variables are set correctly

3. **Production Branch**:
   - Go to Project Settings > Git
   - Set the production branch (usually `main` or `master`)

## Step 6: Test the Deployment

1. Visit your Vercel deployment URL
2. Verify that:
   - The frontend loads correctly
   - API calls to the backend work
   - WebSocket connection is established
   - Authentication functions properly
   - Game submission and other features work as expected

## Troubleshooting

### CORS Issues
If you encounter CORS errors:

1. Ensure your backend has the correct CORS configuration in `server/index.js`:
   ```javascript
   app.use(cors({
     origin: [
       'https://your-vercel-app.vercel.app',
       'https://your-custom-domain.com'
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

### WebSocket Connection Issues
If WebSocket connections fail:

1. Check browser console for specific errors
2. Verify that the WebSocket URL in `web/.env.production` is correct
3. Ensure the backend is properly handling WebSocket connections

### Database Connection Issues
If the backend can't connect to the database:

1. Verify the `DATABASE_URL` environment variable on Railway
2. Check Railway logs for database connection errors

## Continuous Deployment

Both Vercel and Railway support automatic deployments when you push to your GitHub repository. This means:

1. When you push changes to your frontend code, Vercel will automatically rebuild and deploy
2. When you push changes to your backend code, Railway will automatically rebuild and deploy

## Security Considerations

1. Ensure that `SESSION_SECRET` is a strong, random string
2. Consider setting up rate limiting on your API endpoints
3. Implement proper CSRF protection
4. Use HTTPS for all communications (Vercel and Railway handle this automatically)

## Maintenance

1. Regularly update dependencies to patch security vulnerabilities
2. Monitor application logs on both Vercel and Railway for issues
3. Set up alerts for application errors or downtime
