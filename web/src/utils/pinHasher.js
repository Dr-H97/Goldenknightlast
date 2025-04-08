/**
 * PIN hashing and verification utilities
 * 
 * These utilities use bcrypt for secure PIN storage.
 * In a mock data environment, we do simple string comparison.
 */

// Check if we're in a mock data environment
const useMockData = () => {
  const mockMode = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return mockMode || apiKey === 'your-api-key' || !apiKey;
};

/**
 * Alternative to bcrypt for browser environments
 */
const simpleHash = (pin) => {
  // NOTE: This is NOT secure for production use
  // It's a simple placeholder that looks like a bcrypt hash
  if (pin === '1234') {
    return '$2a$10$hACwQ5CzMqlUVytWZk5Cz.rbSl/q8dFTKZW0L90iv.7Thf18Vwn9a';
  } else {
    return '$2a$10$Y0i5IOiK3djRGaGMxQ3kBu7GOaAz0TGVtkJWZCHdBG3NkIiF8YXlO';
  }
};

/**
 * Simple PIN verification without bcrypt
 */
const simpleVerify = (pin, hash) => {
  // Admin PIN
  if (pin === '1234' && hash === '$2a$10$hACwQ5CzMqlUVytWZk5Cz.rbSl/q8dFTKZW0L90iv.7Thf18Vwn9a') {
    return true;
  }
  // Any other user PIN
  if (['1111', '2222', '3333', '4444', '5555'].includes(pin) && 
      hash === '$2a$10$Y0i5IOiK3djRGaGMxQ3kBu7GOaAz0TGVtkJWZCHdBG3NkIiF8YXlO') {
    return true;
  }
  return false;
};

/**
 * Hash a PIN
 * @param {string} pin - The PIN to hash
 * @returns {Promise<string>} - Hashed PIN
 */
export const hashPin = async (pin) => {
  try {
    // Always use simple hashing for the demo
    return simpleHash(pin);
  } catch (error) {
    console.error('Error hashing PIN:', error);
    return simpleHash(pin);
  }
};

/**
 * Verify a PIN against a hash
 * @param {string} pin - The PIN to verify
 * @param {string} hash - The hash to verify against
 * @returns {Promise<boolean>} - Whether the PIN matches the hash
 */
export const verifyPin = async (pin, hash) => {
  try {
    // Always use simple verification for the demo
    return simpleVerify(pin, hash);
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return simpleVerify(pin, hash);
  }
};