# Chess Club Application

A modern web application for chess clubs to track player ratings, manage games, and view statistics.

## Simplified Architecture

This application has been simplified to use:
- Firebase for backend (authentication and database)
- React/Vite for the frontend

This serverless approach makes deployment much easier and completely free!

## Features

- Player authentication using PIN codes
- ELO rating tracking
- Game submission and verification
- Player rankings and statistics
- Admin management for players and games
- Mobile-friendly responsive design
- Dark/light theme support
- Multilingual (English/French)

## Local Development

1. Clone this repository
2. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Anonymous) and Firestore Database
   - Copy your Firebase config values

3. Create environment variables:
   - Create a `.env` file in the `web` directory
   - Add your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Install dependencies:
   ```
   npm install
   cd web
   npm install
   ```

5. Start the development server:
   ```
   cd web
   npm run dev
   ```

6. Open in your browser: http://localhost:5000

## Deployment

See the [SIMPLIFIED_DEPLOYMENT_GUIDE.md](SIMPLIFIED_DEPLOYMENT_GUIDE.md) for detailed instructions on how to deploy this application for free using:
- Firebase (database and authentication)
- Vercel (frontend hosting)

## Default Login

- Username: Admin
- PIN: 1234

## License

MIT