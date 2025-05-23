import { setSessionMockData } from './mockData';

// Sample players
const MOCK_PLAYERS = [
  {
    id: "1", 
    username: "Admin", 
    full_name: "Administrator", 
    elo: 1900, 
    games_played: 20, 
    games_won: 15, 
    games_lost: 3, 
    games_drawn: 2, 
    is_admin: true,
    created_at: "2023-01-01T00:00:00.000Z",
    pin_hash: "$2a$10$hACwQ5CzMqlUVytWZk5Cz.rbSl/q8dFTKZW0L90iv.7Thf18Vwn9a" // hashed "1234"
  },
  {
    id: "2", 
    username: "Alice", 
    full_name: "Alice Johnson", 
    elo: 1750, 
    games_played: 15, 
    games_won: 10, 
    games_lost: 3, 
    games_drawn: 2, 
    is_admin: false,
    created_at: "2023-01-02T00:00:00.000Z",
    pin_hash: "$2a$10$Y0i5IOiK3djRGaGMxQ3kBu7GOaAz0TGVtkJWZCHdBG3NkIiF8YXlO" // hashed "1111"
  },
  {
    id: "3", 
    username: "Bob", 
    full_name: "Bob Smith", 
    elo: 1650, 
    games_played: 12, 
    games_won: 7, 
    games_lost: 4, 
    games_drawn: 1, 
    is_admin: false,
    created_at: "2023-01-03T00:00:00.000Z",
    pin_hash: "$2a$10$Y0i5IOiK3djRGaGMxQ3kBu7GOaAz0TGVtkJWZCHdBG3NkIiF8YXlO" // hashed "2222"
  },
  {
    id: "4", 
    username: "Carol", 
    full_name: "Carol Davis", 
    elo: 1800, 
    games_played: 18, 
    games_won: 12, 
    games_lost: 4, 
    games_drawn: 2, 
    is_admin: false,
    created_at: "2023-01-04T00:00:00.000Z",
    pin_hash: "$2a$10$Y0i5IOiK3djRGaGMxQ3kBu7GOaAz0TGVtkJWZCHdBG3NkIiF8YXlO" // hashed "3333"
  },
  {
    id: "5", 
    username: "Dave", 
    full_name: "Dave Wilson", 
    elo: 1600, 
    games_played: 10, 
    games_won: 5, 
    games_lost: 4, 
    games_drawn: 1, 
    is_admin: false,
    created_at: "2023-01-05T00:00:00.000Z",
    pin_hash: "$2a$10$Y0i5IOiK3djRGaGMxQ3kBu7GOaAz0TGVtkJWZCHdBG3NkIiF8YXlO" // hashed "4444"
  },
  {
    id: "6", 
    username: "Eve", 
    full_name: "Eve Brown", 
    elo: 1550, 
    games_played: 8, 
    games_won: 4, 
    games_lost: 3, 
    games_drawn: 1, 
    is_admin: false,
    created_at: "2023-01-06T00:00:00.000Z",
    pin_hash: "$2a$10$Y0i5IOiK3djRGaGMxQ3kBu7GOaAz0TGVtkJWZCHdBG3NkIiF8YXlO" // hashed "5555"
  }
];

// Sample games
const MOCK_GAMES = [
  {
    id: "1",
    white_player_id: "2", // Alice
    black_player_id: "3", // Bob
    white_player_name: "Alice",
    black_player_name: "Bob",
    result: "1-0", // White win
    date: "2023-02-01T14:00:00.000Z",
    white_elo_before: 1700,
    black_elo_before: 1600,
    white_elo_after: 1715,
    black_elo_after: 1585,
    verified: true,
    verifier_id: "1", // Admin
    verifier_name: "Admin"
  },
  {
    id: "2",
    white_player_id: "4", // Carol
    black_player_id: "5", // Dave
    white_player_name: "Carol",
    black_player_name: "Dave",
    result: "1/2-1/2", // Draw
    date: "2023-02-02T15:30:00.000Z",
    white_elo_before: 1780,
    black_elo_before: 1590,
    white_elo_after: 1775,
    black_elo_after: 1595,
    verified: true,
    verifier_id: "1", // Admin
    verifier_name: "Admin"
  },
  {
    id: "3",
    white_player_id: "3", // Bob
    black_player_id: "6", // Eve
    white_player_name: "Bob",
    black_player_name: "Eve",
    result: "0-1", // Black win
    date: "2023-02-03T16:45:00.000Z",
    white_elo_before: 1585,
    black_elo_before: 1530,
    white_elo_after: 1570,
    black_elo_after: 1545,
    verified: true,
    verifier_id: "1", // Admin
    verifier_name: "Admin"
  },
  {
    id: "4",
    white_player_id: "2", // Alice
    black_player_id: "4", // Carol
    white_player_name: "Alice",
    black_player_name: "Carol",
    result: "0-1", // Black win
    date: "2023-02-04T17:15:00.000Z",
    white_elo_before: 1715,
    black_elo_before: 1775,
    white_elo_after: 1700,
    black_elo_after: 1790,
    verified: true,
    verifier_id: "1", // Admin
    verifier_name: "Admin"
  },
  {
    id: "5",
    white_player_id: "5", // Dave
    black_player_id: "6", // Eve
    white_player_name: "Dave",
    black_player_name: "Eve",
    result: "1-0", // White win
    date: "2023-02-05T10:00:00.000Z",
    white_elo_before: 1595,
    black_elo_before: 1545,
    white_elo_after: 1610,
    black_elo_after: 1530,
    verified: false,
    verifier_id: null,
    verifier_name: null
  }
];

// Initialize mock data
export const initData = () => {
  console.log("Initializing mock data for demo...");
  setSessionMockData('players', MOCK_PLAYERS);
  setSessionMockData('games', MOCK_GAMES);
};