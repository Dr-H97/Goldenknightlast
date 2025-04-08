// Firebase Authentication Service
import { 
  signInAnonymously, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { verifyPin } from '../utils/pinHasher';

/**
 * Sign in anonymously for PIN-based authentication
 */
export const loginAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const logout = async () => {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

/**
 * Pin Authentication for Chess Club Players
 * This combines Firebase Auth with our player data
 */
export const authenticateWithPin = async (playerName, pin) => {
  try {
    // First, find the player document by name
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('name', '==', playerName));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error(`Player ${playerName} not found`);
    }
    
    // Get the player data
    const playerDoc = querySnapshot.docs[0];
    const playerData = playerDoc.data();
    
    // Verify PIN
    const isPinValid = await verifyPin(pin, playerData.pin_hash);
    
    if (!isPinValid) {
      throw new Error('Incorrect PIN');
    }
    
    // If PIN is valid, sign in anonymously to get Firebase Auth token
    const user = await loginAnonymously();
    
    // Return player data with Firebase user ID
    return {
      ...playerData,
      id: playerDoc.id,
      uid: user.uid
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

/**
 * Get the current user's player data
 */
export const getCurrentPlayer = async (uid) => {
  if (!uid) {
    return null;
  }
  
  try {
    // First check the local storage for player data
    const storedPlayer = localStorage.getItem('currentPlayer');
    if (storedPlayer) {
      return JSON.parse(storedPlayer);
    }
    
    // If not found in storage, query Firestore
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const playerDoc = querySnapshot.docs[0];
    const playerData = {
      ...playerDoc.data(),
      id: playerDoc.id
    };
    
    // Cache player data
    localStorage.setItem('currentPlayer', JSON.stringify(playerData));
    return playerData;
  } catch (error) {
    console.error('Error getting current player:', error);
    return null;
  }
};