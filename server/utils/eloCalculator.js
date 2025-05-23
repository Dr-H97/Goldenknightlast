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
const calculateNewRatings = (whiteElo, blackElo, gameResult) => {
  // Constants for ELO calculation
  const K = 20; // K-factor for rating changes (standard ELO formula)
  
  // Calculate expected scores
  const expectedWhite = 1 / (1 + Math.pow(10, (blackElo - whiteElo) / 400));
  const expectedBlack = 1 / (1 + Math.pow(10, (whiteElo - blackElo) / 400));
  
  // Determine actual scores based on game result
  let actualWhite, actualBlack;
  
  if (gameResult === '1-0') {
    // White wins
    actualWhite = 1;
    actualBlack = 0;
  } else if (gameResult === '0-1') {
    // Black wins
    actualWhite = 0;
    actualBlack = 1;
  } else {
    // Draw
    actualWhite = 0.5;
    actualBlack = 0.5;
  }
  
  // Calculate ELO changes
  const whiteEloChange = Math.round(K * (actualWhite - expectedWhite));
  const blackEloChange = Math.round(K * (actualBlack - expectedBlack));
  
  // Calculate new ratings
  const whiteNewElo = whiteElo + whiteEloChange;
  const blackNewElo = blackElo + blackEloChange;
  
  return {
    whiteNewElo,
    blackNewElo,
    whiteEloChange,
    blackEloChange
  };
};

module.exports = {
  calculateNewRatings
};
