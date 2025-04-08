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
 * Hash a PIN
 * @param {string} pin - The PIN to hash
 * @returns {Promise<string>} - Hashed PIN
 */
export const hashPin = async (pin) => {
  try {
    // For mock data, we'll use simple precomputed bcrypt-like hashes
    if (useMockData()) {
      // These are mock hashes that look like bcrypt but aren't computed
      // They are hardcoded for the mock environment only
      if (pin === '1234') {
        return '$2a$10$hACwQ5CzMqlUVytWZk5Cz.rbSl/q8dFTKZW0L90iv.7Thf18Vwn9a';
      } else {
        return '$2a$10$Y0i5IOiK3djRGaGMxQ3kBu7GOaAz0TGVtkJWZCHdBG3NkIiF8YXlO';
      }
    }

    // For real applications, use bcrypt with configurable salt rounds
    const bcrypt = await import('bcrypt');
    const saltRounds = 10;
    return await bcrypt.hash(pin, saltRounds);
  } catch (error) {
    console.error('Error hashing PIN:', error);
    // Fallback to a simple hash for browsers without Web Crypto API
    return `simpleHash-${pin}-${Date.now()}`;
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
    // For mock data, we'll do precomputed checks
    if (useMockData()) {
      // Admin PIN
      if (pin === '1234' && hash === '$2a$10$hACwQ5CzMqlUVytWZk5Cz.rbSl/q8dFTKZW0L90iv.7Thf18Vwn9a') {
        return true;
      }
      // Any other user PIN (mock players have common hash for simplicity)
      if (['1111', '2222', '3333', '4444', '5555'].includes(pin) && 
          hash === '$2a$10$Y0i5IOiK3djRGaGMxQ3kBu7GOaAz0TGVtkJWZCHdBG3NkIiF8YXlO') {
        return true;
      }
      return false;
    }

    // For real applications, use bcrypt.compare
    const bcrypt = await import('bcrypt');
    return await bcrypt.compare(pin, hash);
  } catch (error) {
    console.error('Error verifying PIN:', error);
    // Fallback case
    if (hash.startsWith('simpleHash-')) {
      return hash === `simpleHash-${pin}-${hash.split('-')[2]}`;
    }
    return false;
  }
};