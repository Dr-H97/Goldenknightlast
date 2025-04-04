package com.chessclub.app.utils;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class PinHasher {
    
    private static final String SALT = "ChessClubAppSalt2023";
    
    /**
     * Hash a PIN with salt using SHA-256
     * @param pin The PIN to hash
     * @return The hashed PIN or empty string if error
     */
    public static String hashPin(String pin) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String saltedPin = pin + SALT;
            md.update(saltedPin.getBytes());
            byte[] digest = md.digest();
            
            // Convert to hex string
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return "";
        }
    }
    
    /**
     * Verify a PIN against a hash
     * @param pin The PIN to verify
     * @param hash The hash to check against
     * @return true if the PIN matches the hash
     */
    public static boolean verifyPin(String pin, String hash) {
        String computedHash = hashPin(pin);
        return computedHash.equals(hash);
    }
}
