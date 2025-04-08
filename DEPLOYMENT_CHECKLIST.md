# Golden Knight Chess Club - Deployment Checklist

## Pre-Deployment Checklist

### Code Organization
- [x] Frontend code in `/web` directory
- [x] Backend code in `/server` directory
- [x] Proper separation of concerns

### Environment Configuration
- [x] `.env.example` file with all required variables
- [x] `Procfile` for Render deployment
- [x] `render.yaml` for Blueprint deployment

### Frontend (React/Vite)
- [x] Build script configured correctly
- [x] WebSocket connection handles both development and production environments
- [x] API calls use relative paths
- [x] Static assets optimized

### Backend (Express)
- [x] Static file serving for production build
- [x] CORS configured for production
- [x] Error handling middleware
- [x] WebSocket server properly initialized
- [x] Environment variable validation

### Database
- [x] Drizzle ORM configured correctly
- [x] Migration scripts ready
- [x] Seed data for development only
- [x] Connection pooling configured

## Render Deployment Steps

1. **Create PostgreSQL Database**
   - Go to Render Dashboard → New → PostgreSQL
   - Configure name, region, and plan
   - Copy the Internal Database URL

2. **Create Web Service**
   - Go to Render Dashboard → New → Web Service
   - Connect GitHub repository
   - Configure build and start commands:
     - Build Command: `npm install && cd web && npm install && npm run build`
     - Start Command: `node server/index.js`
   - Set environment variables:
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: (paste from step 1)
     - `PORT`: `10000`
     - `JWT_SECRET`: (generate secure random string)

3. **Run Database Migrations**
   - After deployment, use Render Shell to run:
     ```
     node db-push.js
     ```

4. **Verify Deployment**
   - Test user authentication (Admin/1234)
   - Test game submission
   - Test real-time updates
   - Test admin features

## Post-Deployment Tasks

- [ ] Set up custom domain (if needed)
- [ ] Configure SSL certificates
- [ ] Set up monitoring alerts
- [ ] Schedule regular database backups
- [ ] Document API endpoints

## Troubleshooting Guide

### WebSocket Connection Issues
```javascript
// Client code should use:
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}/ws`;

// Server code should use:
const wss = new WebSocketServer({ server, path: '/ws' });
```

### Database Connection Issues
- Verify DATABASE_URL environment variable
- Check database service status in Render dashboard
- Try connecting with external client

### Static Files Not Loading
- Verify build process completes successfully
- Check for proper static file serving in server code:
```javascript
app.use(express.static(path.join(__dirname, '../web/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/dist/index.html'));
});
```

## Performance Optimization

- Enable compression middleware
- Configure proper cache headers
- Use connection pooling for database
- Consider adding a CDN for static assets