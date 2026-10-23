package com.railgo.jsp.util;

import org.junit.jupiter.api.Test;
import java.time.LocalDate;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class ValidationTest {
    @Test
    void signupRejectsWeakAndMismatchedPasswords() {
        Map<String, String> errors = Validation.signup("Asha Railgo", "asha@example.com", "9876543210", "weak", "different");
        assertTrue(errors.containsKey("password"));
        assertTrue(errors.containsKey("confirmPassword"));
    }

    @Test
    void journeyRejectsSameStationsAndPastDate() {
        Map<String, String> errors = Validation.journey("Delhi", "delhi", LocalDate.now().minusDays(1).toString(), "Sleeper");
        assertEquals("Choose a different destination station.", errors.get("to"));
        assertEquals("Choose today or a future journey date.", errors.get("date"));
    }
}
