# Golden Knight Chess Club Android App - Setup Guide

This guide will walk you through the steps to set up and deploy the Android app for the Golden Knight Chess Club.

## Prerequisites

1. Android Studio (latest version recommended)
2. A Firebase account
3. Basic knowledge of Android development

## Step 1: Set Up Firebase Project

You've already completed the first step by providing the Firebase project ID, API key, and app ID. These have been configured in the Android app.

## Step 2: Download and Open the Project

1. Download the `ChessClubAndroid` folder from this Replit project
2. Open the project in Android Studio by selecting "Open an Existing Project" and navigating to the downloaded folder

## Step 3: Connect to Firebase

The app has been pre-configured with your Firebase credentials. However, you should download the complete `google-services.json` file from your Firebase console:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the Android app you've created (package name: `com.chessclub.android`)
4. Click "Download google-services.json"
5. Place this file in the `app/` directory of your Android project

## Step 4: Set Up Firebase Authentication

1. In the Firebase Console, go to Authentication
2. Enable Email/Password sign-in method
3. (Optional) Add some test users or enable other authentication methods as needed

## Step 5: Set Up Firestore Database

1. In the Firebase Console, go to Firestore Database
2. Create a database (start in test mode for development)
3. Create two collections: `players` and `games`

## Step 6: Migrate Data from PostgreSQL

We've included a data migration script (`dataMigration.js`) to help you transfer your existing data from PostgreSQL to Firebase:

1. Make sure you have Node.js installed
2. Install required dependencies: `npm install pg firebase-admin dotenv`
3. Create a `.env` file with your PostgreSQL connection string:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```
4. Generate a Firebase Admin SDK service account key:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in the same directory as the migration script
5. Run the script: `node dataMigration.js`

## Step 7: Build and Run the Android App

1. In Android Studio, connect an Android device or start an emulator
2. Click the Run button (green triangle) in the toolbar
3. Test the app thoroughly to ensure all features work as expected

## Key Features of the Android App

- **Authentication**: Secure login using player names and PINs
- **Rankings**: View player rankings sorted by ELO rating
- **Game History**: Browse games played by the logged-in player
- **Game Submission**: Submit new game results with PIN verification
- **Profile Management**: View statistics and change PIN
- **Real-time Updates**: Changes are synchronized with Firebase in real-time
- **Multiple Languages**: Support for English and French

## App Structure

- **Models**: Data classes for players and games
- **Repositories**: Handle data operations with Firebase
- **ViewModels**: Manage UI-related data and business logic
- **UI**: Activities and fragments for different screens
- **Utils**: Utility classes including Firebase operations and ELO calculations

## Troubleshooting

- **Build Errors**: Ensure you have the latest Android SDK and Build Tools
- **Firebase Connection Issues**: Verify your `google-services.json` is correctly placed
- **Data Migration Errors**: Check database connection strings and permissions
- **Authentication Failures**: Ensure Firebase Authentication is properly configured

## Next Steps

1. **Customize the App**: Modify colors, themes, and assets as needed
2. **Add Features**: Implement additional features like notifications or tournaments
3. **Deploy to Google Play**: Create a signed APK or App Bundle and upload to Google Play
4. **Monitor Usage**: Use Firebase Analytics to track user engagement

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Android Developer Documentation](https://developer.android.com/docs)
- [Kotlin Documentation](https://kotlinlang.org/docs/home.html)