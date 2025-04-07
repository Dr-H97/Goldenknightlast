# Firebase Import Instructions for Chess Club App

This guide will help you import your database data into Firebase Firestore for the Android application.

## Option 1: Using Firebase Console (Manual Import)

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database
4. Create two collections:
   - `players`
   - `games`
5. For each player entry in the JSON:
   - Create a new document in the `players` collection with ID matching the `id` field
   - Add all fields from the player object
6. For each game entry in the JSON:
   - Create a new document in the `games` collection with ID matching the `id` field
   - Add all fields from the game object

## Option 2: Using Firebase Admin SDK (Automated Import)

1. Download the `firebase-import.json` file from this Replit project
2. Install Node.js on your computer if you don't have it already
3. Create a new folder for the import script
4. Create a `package.json` file:
   ```json
   {
     "name": "firebase-import",
     "version": "1.0.0",
     "description": "Import chess club data to Firebase",
     "main": "import.js",
     "dependencies": {
       "firebase-admin": "^11.9.0"
     }
   }
   ```
5. Install dependencies: `npm install`
6. Generate a service account key from Firebase:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the file as `serviceAccountKey.json` in your script folder
7. Create an `import.js` file:
   ```javascript
   const admin = require('firebase-admin');
   const fs = require('fs');

   // Load the service account key
   const serviceAccount = require('./serviceAccountKey.json');

   // Load the data
   const data = require('./firebase-import.json');

   // Initialize Firebase
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
   });

   const db = admin.firestore();

   async function importData() {
     try {
       console.log('Starting data import...');
       
       // Import players
       console.log('Importing players...');
       const playersCollection = db.collection('players');
       for (const [id, player] of Object.entries(data.players)) {
         await playersCollection.doc(id).set(player);
         console.log(`Imported player: ${player.name}`);
       }
       
       // Import games
       console.log('Importing games...');
       const gamesCollection = db.collection('games');
       for (const [id, game] of Object.entries(data.games)) {
         await gamesCollection.doc(id).set(game);
         console.log(`Imported game: ${game.whitePlayerName} vs ${game.blackPlayerName}`);
       }
       
       console.log('Import completed successfully!');
     } catch (error) {
       console.error('Error during import:', error);
     }
   }

   importData();
   ```
8. Run the script: `node import.js`

## Firebase Data Structure

### Players Collection
Each document represents a player with fields:
- id: String - Player's unique identifier
- name: String - Player's name
- rating: Number - Player's current ELO rating
- pin: String - Player's PIN (hashed)
- isAdmin: Boolean - Whether the player is an admin
- gamesPlayed: Number - Total games played
- gamesWon: Number - Games won
- gamesLost: Number - Games lost
- gamesDrawn: Number - Games drawn
- createdAt: Number - Timestamp when the player was created (milliseconds)

### Games Collection
Each document represents a game with fields:
- id: String - Game's unique identifier
- whitePlayerId: String - ID of the player who played white
- blackPlayerId: String - ID of the player who played black
- result: String - Game result ('1-0', '0-1', or '1/2-1/2')
- date: Number - Timestamp when the game was played (milliseconds)
- verified: Boolean - Whether the game has been verified
- whitePlayerName: String - Name of the white player
- blackPlayerName: String - Name of the black player
- whitePlayerRatingBefore: Number - White player's rating before the game
- blackPlayerRatingBefore: Number - Black player's rating before the game
- whitePlayerRatingAfter: Number - White player's rating after the game
- blackPlayerRatingAfter: Number - Black player's rating after the game
- whiteEloChange: Number - Change in white player's rating
- blackEloChange: Number - Change in black player's rating