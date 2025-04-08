/**
 * Utility for hashing and verifying PINs
 * For a real application, you'd use a more secure hashing method
 * but for simplicity, we're using a basic bcrypt-like implementation
 */

// Number of rounds for hashing (higher = more secure but slower)
const HASH_ROUNDS = 10;

/**
 * Hash a PIN
 * @param {string} pin - The PIN to hash
 * @returns {Promise<string>} - Hashed PIN
 */
export const hashPin = async (pin) => {
  // In a real application, you would use bcrypt or a similar library
  // For simplicity in this example, we're using a basic hash method
  try {
    // Convert pin to string if it's a number
    const pinStr = pin.toString();
    
    // Create a simple salt (in a real app this would be more secure)
    const salt = Math.random().toString(36).substring(2, 15);
    
    // Encode the PIN with the salt
    const encoder = new TextEncoder();
    const data = encoder.encode(pinStr + salt);
    
    // Use Web Crypto API for hashing
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert ArrayBuffer to string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Store the salt with the hash
    return `${salt}:${hashHex}`;
  } catch (error) {
    console.error('Error hashing PIN:', error);
    throw error;
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
    // Convert pin to string if it's a number
    const pinStr = pin.toString();
    
    // Extract salt from the stored hash
    const [salt, storedHash] = hash.split(':');
    
    // Encode the PIN with the extracted salt
    const encoder = new TextEncoder();
    const data = encoder.encode(pinStr + salt);
    
    // Use Web Crypto API for hashing
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert ArrayBuffer to string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Compare the computed hash with the stored hash
    return hashHex === storedHash;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};