// Firebase initialization and sample data setup
import { 
  collection, 
  getDocs, 
  query, 
  limit, 
  doc,
  setDoc, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { hashPin } from '../utils/pinHasher';

// Check environment variables
const checkFirebaseConfig = () => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const appId = import.meta.env.VITE_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !appId) {
    console.error('Firebase configuration incomplete. Missing environment variables.');
    return false;
  }

  return true;
};

// Create initial admin user if no users exist
const createAdminUser = async () => {
  // Check if players collection already has documents
  const playersRef = collection(db, 'players');
  const q = query(playersRef, limit(1));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    console.log('Database already has player data.');
    return false;
  }
  
  console.log('Creating admin user...');
  
  try {
    // Create admin user
    const pinHash = await hashPin('1234');
    
    const adminData = {
      name: 'Admin',
      elo: 2000,
      pin_hash: pinHash,
      is_admin: true,
      games_played: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    // Add admin user
    await addDoc(collection(db, 'players'), adminData);
    
    console.log('Admin user created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
};

// Create sample players
const createSamplePlayers = async () => {
  console.log('Creating sample players...');
  
  try {
    const samplePlayers = [
      {
        name: 'Alice',
        elo: 1800,
        pin_hash: await hashPin('1111'),
        is_admin: false,
        games_played: 0,
        wins: 0,
        losses: 0,
        draws: 0
      },
      {
        name: 'Bob',
        elo: 1650,
        pin_hash: await hashPin('2222'),
        is_admin: false,
        games_played: 0,
        wins: 0,
        losses: 0,
        draws: 0
      },
      {
        name: 'Charlie',
        elo: 1500,
        pin_hash: await hashPin('3333'),
        is_admin: false,
        games_played: 0,
        wins: 0,
        losses: 0,
        draws: 0
      }
    ];
    
    // Add timestamp to each player
    const playersWithTimestamp = samplePlayers.map(player => ({
      ...player,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    }));
    
    // Add players to database
    for (const player of playersWithTimestamp) {
      await addDoc(collection(db, 'players'), player);
    }
    
    console.log('Sample players created successfully.');
    return true;
  } catch (error) {
    console.error('Error creating sample players:', error);
    return false;
  }
};

/**
 * Initialize Firebase with sample data if needed
 */
export const initializeFirebase = async () => {
  // Check if Firebase is properly configured
  if (!checkFirebaseConfig()) {
    console.warn('Firebase configuration is incomplete. Please check your environment variables.');
    return false;
  }
  
  try {
    console.log('Initializing Firebase...');
    
    // Create admin user if no users exist
    const adminCreated = await createAdminUser();
    
    // If admin was created, also create sample players
    if (adminCreated) {
      await createSamplePlayers();
    }
    
    console.log('Firebase initialization complete.');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
};