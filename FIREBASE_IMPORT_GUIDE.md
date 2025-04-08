# Firebase Data Import Guide

This guide will help you import the sample data into your Firebase project.

## Prerequisites

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database in your Firebase project
3. Set up Authentication with Anonymous sign-in enabled
4. Add your web app to the Firebase project to get your configuration

## Steps to Import Data

### Method 1: Manual Import through Firebase Console

1. Go to your [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** in the left menu
4. Create the collections manually:

   - Create a collection called `players`
   - For each player in the `firebase_import_data.json` file:
     - Add a new document with the ID matching the "id" field
     - Add all fields from the JSON object

   - Create a collection called `games`
   - For each game in the `firebase_import_data.json` file:
     - Add a new document with the ID matching the "id" field
     - Add all fields from the JSON object

### Method 2: Import Using Firebase CLI

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize your project:
   ```bash
   firebase init firestore
   ```

4. Create a directory structure for import:
   ```
   /firestore_import
     /players
       1.json
       2.json
       ...
     /games
       1.json
       2.json
       ...
   ```

5. Split the `firebase_import_data.json` into individual files for each document
   (You can use a script to do this)

6. Import the data:
   ```bash
   firebase firestore:import --project=YOUR_PROJECT_ID ./firestore_import
   ```

### Method 3: Using Firebase Admin SDK (Node.js Script)

1. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

2. Create a service account key in Firebase Console:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

3. Create a Node.js script called `import-data.js`:

```javascript
const admin = require('firebase-admin');
const fs = require('fs');

// Initialize the app with a service account
const serviceAccount = require('./path-to-your-service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Read the import file
const data = JSON.parse(fs.readFileSync('./firebase_import_data.json', 'utf8'));

// Import players
async function importPlayers() {
  const batch = db.batch();
  const players = data.players;
  
  for (const player of players) {
    const id = player.id;
    delete player.id; // Remove ID from fields
    const docRef = db.collection('players').doc(id);
    batch.set(docRef, player);
  }
  
  await batch.commit();
  console.log('Players imported successfully!');
}

// Import games
async function importGames() {
  const batch = db.batch();
  const games = data.games;
  
  for (const game of games) {
    const id = game.id;
    delete game.id; // Remove ID from fields
    const docRef = db.collection('games').doc(id);
    batch.set(docRef, game);
  }
  
  await batch.commit();
  console.log('Games imported successfully!');
}

// Run the import
async function runImport() {
  try {
    await importPlayers();
    await importGames();
    console.log('Data import completed successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
  }
}

runImport();
```

4. Run the script:
   ```bash
   node import-data.js
   ```

## User Account Information

Once the data is imported, you can use the following account credentials:

- **Admin User**:
  - Username: `Admin`
  - PIN: `1234`

- **Regular Players**:
  - Username: `Alice` (or any other player name)
  - PIN: `1111` (all sample players have the same PIN for simplicity)

## Firestore Security Rules

For basic security, add these rules to your Firestore database:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to authenticated users
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

## Updating Environment Variables

After setting up Firebase, update your `.env` file with your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_PROJECT_ID=your-project-id-here
VITE_FIREBASE_APP_ID=your-app-id-here
VITE_USE_MOCK_DATA=false
```

This will allow your application to connect to your Firebase project instead of using mock data.