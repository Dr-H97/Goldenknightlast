/**
 * Calculate new ELO ratings based on game result
 * 
 * Formula used: Ra_new = Ra + K * (S - Ea)
 * Where:
 * - Ra is the current rating of player
 * - Ea is the expected score = 1 / (1 + 10^((Rb - Ra)/400))
 * - S is the actual score (1 for win, 0.5 for draw, 0 for loss)
 * - K is the K-factor (set to 20)
 * 
 * @param {number} whiteElo - White player's current ELO rating
 * @param {number} blackElo - Black player's current ELO rating
 * @param {string} gameResult - Result of the game ('1-0' for white win, '0-1' for black win, '1/2-1/2' for draw)
 * @returns {Object} - New ELO ratings and changes
 */
export const calculateElo = (whiteElo, blackElo, gameResult) => {
  // K-factor (determines the maximum change in rating)
  const K = 20;
  
  // Convert ratings to numbers to ensure proper calculation
  const whiteRating = Number(whiteElo);
  const blackRating = Number(blackElo);
  
  // Calculate expected scores
  const whiteExpected = 1 / (1 + Math.pow(10, (blackRating - whiteRating) / 400));
  const blackExpected = 1 / (1 + Math.pow(10, (whiteRating - blackRating) / 400));
  
  // Determine actual scores based on game result
  let whiteActual, blackActual;
  
  if (gameResult === '1-0') {
    // White wins
    whiteActual = 1;
    blackActual = 0;
  } else if (gameResult === '0-1') {
    // Black wins
    whiteActual = 0;
    blackActual = 1;
  } else {
    // Draw
    whiteActual = 0.5;
    blackActual = 0.5;
  }
  
  // Calculate new ratings
  const whiteNewEloRaw = whiteRating + K * (whiteActual - whiteExpected);
  const blackNewEloRaw = blackRating + K * (blackActual - blackExpected);
  
  // Round to nearest integer
  const whiteNewElo = Math.round(whiteNewEloRaw);
  const blackNewElo = Math.round(blackNewEloRaw);
  
  // Calculate rating changes
  const whiteEloChange = whiteNewElo - whiteRating;
  const blackEloChange = blackNewElo - blackRating;
  
  return {
    whiteNewElo,
    blackNewElo,
    whiteEloChange,
    blackEloChange
  };
};

/**
 * Calculate performance rating
 * 
 * Formula: R_avg + D where D = -400 * log10((1-P)/P)
 * Where:
 * - R_avg is the average rating of opponents
 * - P is the performance (fraction of points scored)
 * 
 * @param {number[]} opponentRatings - Array of opponent ratings
 * @param {number[]} results - Array of results (1 for win, 0.5 for draw, 0 for loss)
 * @returns {number} - Performance rating
 */
export const calculatePerformanceRating = (opponentRatings, results) => {
  if (opponentRatings.length === 0 || opponentRatings.length !== results.length) {
    return 0;
  }
  
  // Calculate average opponent rating
  const avgOpponentRating = opponentRatings.reduce((sum, rating) => sum + Number(rating), 0) / opponentRatings.length;
  
  // Calculate performance (percentage of points scored)
  const points = results.reduce((sum, result) => sum + result, 0);
  const performance = points / results.length;
  
  // Avoid division by zero or log of zero
  if (performance === 0) return avgOpponentRating - 400;
  if (performance === 1) return avgOpponentRating + 400;
  
  // Calculate performance rating
  const D = -400 * Math.log10((1 - performance) / performance);
  const performanceRating = avgOpponentRating + D;
  
  return Math.round(performanceRating);
};