package com.railgo.util;

import java.security.SecureRandom;

public final class PnrGenerator {

  private static final char[] ALPHABET =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
  private static final SecureRandom RANDOM = new SecureRandom();

  private PnrGenerator() {}

  public static String generate() {
    StringBuilder pnr = new StringBuilder("SV");
    for (int index = 0; index < 10; index++) {
      pnr.append(ALPHABET[RANDOM.nextInt(ALPHABET.length)]);
    }
    return pnr.toString();
  }
}
