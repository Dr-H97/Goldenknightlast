# Golden Knight Chess Club Android App

This Android application is a mobile version of the Golden Knight Chess Club web application. It allows chess club members to track their games, view rankings, and manage their profiles using a native Android experience.

## Features

- **Player Authentication**: Secure login with username and PIN
- **Player Rankings**: View current player rankings sorted by ELO rating
- **Game History**: Review your match history with detailed information
- **Game Submission**: Submit new game results directly from your mobile device
- **Player Profiles**: View detailed statistics and rating history
- **Realtime Updates**: Get notified when new games are played
- **Multiple Languages**: Full support for English and French
- **Dark/Light Theme**: Automatically adapts to your device theme settings

## Firebase Setup

To use this application, you'll need to set up Firebase as follows:

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Add an Android app to your Firebase project with package name `com.chessclub.android`
3. Download the `google-services.json` file and place it in the `app/` directory
4. Enable Firebase Authentication in your project (Email/Password method)
5. Set up Cloud Firestore database with the following collections:
   - `players` - Store player information
   - `games` - Store game results

### Database Structure

#### Players Collection
Each document in the `players` collection should have the following fields:
- `id`: Unique identifier (string)
- `name`: Player's name (string)
- `rating`: Current ELO rating (number)
- `gamesPlayed`: Total games played (number)
- `gamesWon`: Games won (number)
- `gamesLost`: Games lost (number)
- `gamesDrawn`: Games drawn (number)
- `isAdmin`: Admin status (boolean)
- `pin`: Authentication PIN (string)
- `createdAt`: Account creation timestamp (number)

#### Games Collection
Each document in the `games` collection should have the following fields:
- `id`: Unique identifier (string)
- `whitePlayerId`: ID of white player (string)
- `blackPlayerId`: ID of black player (string)
- `result`: Game result ("1-0", "0-1", or "1/2-1/2") (string)
- `date`: Game date timestamp (number)
- `verified`: Verification status (boolean)
- `whitePlayerName`: Name of white player (string)
- `blackPlayerName`: Name of black player (string)
- `whitePlayerRatingBefore`: White player rating before game (number)
- `blackPlayerRatingBefore`: Black player rating before game (number)
- `whitePlayerRatingAfter`: White player rating after game (number)
- `blackPlayerRatingAfter`: Black player rating after game (number)

## Data Migration

To migrate data from your existing web application to Firebase:

1. Export your current database tables as JSON
2. Convert the data to the Firebase Firestore format
3. Import the data using Firebase Admin SDK or Firestore batch operations

## Building the App

### Prerequisites

- Android Studio Arctic Fox (2021.3.1) or newer
- Android SDK with compileSdk 33
- JDK 11 or higher

### Steps

1. Clone this repository
2. Open the project in Android Studio
3. Place your `google-services.json` file in the `app/` directory
4. Sync Gradle files
5. Build and run the app

## Configuration

You can customize the app by modifying the following files:

- `colors.xml` - App theme colors
- `strings.xml` - Text translations
- `styles.xml` - App theming

## Deployment

To deploy the app to Google Play Store:

1. Generate a signed APK/AAB
2. Create a Google Play Developer account
3. Create a new app listing
4. Upload your APK/AAB
5. Submit for review

## License

This project is licensed under the MIT License - see the LICENSE file for details.
