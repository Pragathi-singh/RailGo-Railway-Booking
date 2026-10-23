package com.railgo.jsp.util;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.*;
import java.util.Base64;

public final class PasswordHasher {
    private static final int ITERATIONS = 210_000;
    private PasswordHasher() {}
    public static String hash(String password) {
        try {
            byte[] salt = new byte[16]; SecureRandom.getInstanceStrong().nextBytes(salt);
            return encode(salt, derive(password, salt, ITERATIONS));
        } catch (GeneralSecurityException e) { throw new IllegalStateException("Password hashing failed.", e); }
    }
    public static boolean matches(String password, String stored) {
        try {
            String[] parts = stored.split("\\$");
            if (parts.length != 3) return false;
            byte[] salt = Base64.getUrlDecoder().decode(parts[0]);
            byte[] expected = Base64.getUrlDecoder().decode(parts[2]);
            return MessageDigest.isEqual(expected, derive(password, salt, Integer.parseInt(parts[1])));
        } catch (GeneralSecurityException | IllegalArgumentException e) { return false; }
    }
    private static byte[] derive(String password, byte[] salt, int iterations) throws GeneralSecurityException {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, 256);
        return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
    }
    private static String encode(byte[] salt, byte[] hash) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(salt) + "$" + ITERATIONS + "$"
                + Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
    }
}
