# Golden Knight Chess Club

An advanced chess club management application designed for comprehensive player engagement and administrative efficiency, leveraging modern web technologies to create an immersive digital chess experience.

## Features

- Player management with PIN-based authentication
- ELO rating system for chess games
- Comprehensive player statistics and performance tracking
- Game submission and verification system
- Administrative controls for club managers
- Responsive design for mobile and desktop
- Real-time updates with WebSocket integration
- Multilingual support (English and French)
- Dark and light theme support

## Technology Stack

- **Frontend**: React, Vite, Chart.js, React Router
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time**: WebSocket for live updates
- **Authentication**: JWT-based with PIN verification
- **Styling**: CSS with responsive design

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/golden-knight-chess-club.git
   cd golden-knight-chess-club
   ```

2. Install dependencies:
   ```
   npm install
   cd web
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://user:password@localhost:5432/chessclub
   JWT_SECRET=your_secret_key_here
   ```

4. Initialize the database:
   ```
   node db-push.js --with-sample-data
   ```

5. Start the development servers:
   ```
   npm run dev
   ```

6. Access the application:
   - Frontend: http://localhost:5000
   - Backend API: http://localhost:3000

## Deployment to Railway

Railway is a modern platform that makes deploying full-stack applications simple. Follow these steps to deploy your Chess Club application:

### Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. Make sure all necessary files are included:
   - `Procfile` (contains: `web: node server/index.js`)
   - `db-push.js` (for database initialization)

### Step 2: Deploy on Railway

1. Create a Railway account at https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect your Node.js application

### Step 3: Add a PostgreSQL Database

1. In your project dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will provision a PostgreSQL database
3. Railway automatically adds the `DATABASE_URL` environment variable

### Step 4: Configure Environment Variables

1. Go to the "Variables" tab in your service settings
2. Add the following environment variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (a secure random string)

### Step 5: Initialize the Database

1. After deployment, open a shell to your service
2. Run: `node db-push.js`
3. Optionally, to initialize with sample data: `node db-push.js --with-sample-data`

### Step 6: Access Your Deployed Application

1. Railway will provide a public URL for your application
2. Open the URL to access your deployed Chess Club application
3. Login with default admin credentials: Username: `Admin`, PIN: `1234`

## API Documentation

The API provides endpoints for managing players, games, and authentication.

### Authentication

- `POST /api/auth/login`: Authenticate a player
- `POST /api/auth/verify`: Verify authentication token

### Players

- `GET /api/players`: Get all players
- `GET /api/players/:id`: Get a specific player
- `POST /api/players`: Create a new player
- `PUT /api/players/:id`: Update a player
- `DELETE /api/players/:id`: Delete a player

### Games

- `GET /api/games`: Get all games
- `GET /api/games/:id`: Get a specific game
- `POST /api/games`: Submit a new game
- `DELETE /api/games/:id`: Delete a game

## WebSocket Events

The application uses WebSockets for real-time updates:

- `game_update`: Sent when a game is added, updated, or deleted
- `player_update`: Sent when a player's data changes

## License

This project is licensed under the ISC License.

## Contributors

- Golden Knight Chess Club Team