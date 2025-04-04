package com.chessclub.app.utils;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

/**
 * Utility class for securely hashing and verifying PIN codes
 */
public class PinHasher {
    private static final String HASH_ALGORITHM = "SHA-256";
    private static final int SALT_LENGTH = 16; // bytes
    private static final String HEX_CHARS = "0123456789ABCDEF";

    /**
     * Generate a secure hash of a PIN code with salt
     * @param pin The PIN code to hash
     * @return String containing salt and hash, separated by ':'
     */
    public static String hashPin(String pin) {
        try {
            // Generate random salt
            SecureRandom random = new SecureRandom();
            byte[] salt = new byte[SALT_LENGTH];
            random.nextBytes(salt);
            
            // Create hash
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            digest.reset();
            digest.update(salt);
            byte[] hash = digest.digest(pin.getBytes());
            
            // Convert to strings
            String saltString = bytesToHex(salt);
            String hashString = bytesToHex(hash);
            
            // Return salt:hash
            return saltString + ":" + hashString;
        } catch (NoSuchAlgorithmException e) {
            // Fallback to simple hashing if SHA-256 is not available
            return pin.hashCode() + "";
        }
    }

    /**
     * Verify if a PIN matches a previously generated hash
     * @param pin PIN to verify
     * @param storedHash Previously generated hash to compare against
     * @return true if PIN matches, false otherwise
     */
    public static boolean verifyPin(String pin, String storedHash) {
        try {
            // Split the stored hash into salt and hash parts
            String[] parts = storedHash.split(":");
            if (parts.length != 2) {
                return false;
            }
            
            String saltString = parts[0];
            String hashString = parts[1];
            
            // Convert salt from hex to bytes
            byte[] salt = hexToBytes(saltString);
            
            // Create hash with the same salt
            MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
            digest.reset();
            digest.update(salt);
            byte[] hash = digest.digest(pin.getBytes());
            
            // Convert to string
            String newHashString = bytesToHex(hash);
            
            // Compare the hashes
            return hashString.equals(newHashString);
        } catch (NoSuchAlgorithmException e) {
            // Fallback to simple comparison if SHA-256 is not available
            return storedHash.equals(pin.hashCode() + "");
        }
    }

    /**
     * Convert bytes to hexadecimal string
     * @param bytes Byte array to convert
     * @return Hexadecimal string representation
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(HEX_CHARS.charAt((b & 0xF0) >> 4));
            result.append(HEX_CHARS.charAt((b & 0x0F)));
        }
        return result.toString();
    }

    /**
     * Convert hexadecimal string to bytes
     * @param hex Hexadecimal string to convert
     * @return Byte array
     */
    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
