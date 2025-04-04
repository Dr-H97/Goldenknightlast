const { pgTable, serial, text, integer, boolean, varchar, timestamp, pgEnum } = require('drizzle-orm/pg-core');

// Players table
const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  pin: text('pin').notNull(), // Hashed PIN
  isAdmin: boolean('is_admin').default(false).notNull(),
  initialElo: integer('initial_elo').default(1200).notNull(),
  currentElo: integer('current_elo').default(1200).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Game result enum
const gameResultEnum = pgEnum('game_result', ['1-0', '0-1', '1/2-1/2']);

// Games table
const games = pgTable('games', {
  id: serial('id').primaryKey(),
  whitePlayerId: integer('white_player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  blackPlayerId: integer('black_player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  result: gameResultEnum('result').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  whiteEloChange: integer('white_elo_change').default(0).notNull(),
  blackEloChange: integer('black_elo_change').default(0).notNull(),
  verified: boolean('verified').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// Type definitions for TypeScript (will be ignored in JavaScript)
/**
 * @typedef {Object} Player
 * @property {number} id
 * @property {string} name
 * @property {string} pin
 * @property {boolean} isAdmin
 * @property {number} initialElo
 * @property {number} currentElo
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Game
 * @property {number} id
 * @property {number} whitePlayerId
 * @property {number} blackPlayerId
 * @property {'1-0' | '0-1' | '1/2-1/2'} result
 * @property {Date} date
 * @property {number} whiteEloChange
 * @property {number} blackEloChange
 * @property {boolean} verified
 * @property {Date} createdAt
 */

/**
 * @typedef {Omit<Player, 'id' | 'createdAt'>} InsertPlayer
 */

/**
 * @typedef {Omit<Game, 'id' | 'createdAt' | 'whiteEloChange' | 'blackEloChange'>} InsertGame
 */

module.exports = {
  players,
  games,
  gameResultEnum
};
