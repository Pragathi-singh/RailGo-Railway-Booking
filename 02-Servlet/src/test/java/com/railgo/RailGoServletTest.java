package com.railgo;

import com.railgo.util.PasswordHasher;
import com.railgo.util.PnrGenerator;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class RailGoServletTest {

  @Test
  void passwordHashVerifiesAndRejectsWrongPassword() {
    String hash = PasswordHasher.hash("ServletPass123");
    assertTrue(PasswordHasher.verify("ServletPass123", hash));
    assertFalse(PasswordHasher.verify("WrongPass123", hash));
  }

  @Test
  void pnrIsUniqueAndStructured() {
    String first = PnrGenerator.generate();
    String second = PnrGenerator.generate();
    assertTrue(first.startsWith("SV"));
    assertEquals(12, first.length());
    assertNotEquals(first, second);
  }
}
