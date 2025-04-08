import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { hashPin } from '../utils/pinHasher';
import { initData } from './initData';

/**
 * Initialize Firebase with sample data if needed
 */
export const initializeFirebase = async () => {
  console.log("Initializing Firebase...");
  
  try {
    // We'll always use mock data for this demo, so initialize it
    initData();
    console.log("Mock data initialized for demo");
    
    // If you want to use real Firebase, comment the above and uncomment below:
    /*
    // Check if we're using mock data (for development or when Firebase isn't configured)
    const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    
    if (apiKey === 'your-api-key' || !apiKey || useMockData) {
      console.log("Using mock data mode - Firebase credentials not provided");
      // In mock data mode, we don't try to interact with Firebase
      return;
    }
    
    // Check if admin user exists
    const adminQuery = query(collection(db, "players"), where("username", "==", "Admin"));
    const adminQuerySnapshot = await getDocs(adminQuery);
    
    if (adminQuerySnapshot.empty) {
      console.log("Creating admin user...");
      
      // Create admin user
      const adminPinHash = await hashPin("1234");
      await addDoc(collection(db, "players"), {
        username: "Admin",
        full_name: "Administrator",
        pin_hash: adminPinHash,
        elo: 1500,
        games_played: 0,
        games_won: 0,
        games_lost: 0,
        games_drawn: 0,
        is_admin: true,
        created_at: new Date().toISOString()
      });
      
      // Create sample players
      const samplePlayers = [
        { username: "Alice", full_name: "Alice Johnson", pin: "1111" },
        { username: "Bob", full_name: "Bob Smith", pin: "2222" },
        { username: "Carol", full_name: "Carol Davis", pin: "3333" },
        { username: "Dave", full_name: "Dave Wilson", pin: "4444" },
        { username: "Eve", full_name: "Eve Brown", pin: "5555" }
      ];
      
      for (const player of samplePlayers) {
        const pinHash = await hashPin(player.pin);
        await addDoc(collection(db, "players"), {
          username: player.username,
          full_name: player.full_name,
          pin_hash: pinHash,
          elo: 1500,
          games_played: 0,
          games_won: 0,
          games_lost: 0,
          games_drawn: 0,
          is_admin: false,
          created_at: new Date().toISOString()
        });
      }
      
      console.log("Sample data initialized successfully!");
    } else {
      console.log("Firebase already initialized with data.");
    }
    */
  } catch (error) {
    console.error("Error initializing Firebase data:", error);
    console.log("Application will use mock data instead");
    // Fallback to mock data
    initData();
  }
};