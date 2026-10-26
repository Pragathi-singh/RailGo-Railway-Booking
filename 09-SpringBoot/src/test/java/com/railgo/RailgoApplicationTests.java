package com.railgo;

import com.railgo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class RailgoApplicationTests {
    @Autowired MockMvc mvc;
    @Autowired UserRepository users;

    @Test void homeAndAssetsArePublic() throws Exception {
        mvc.perform(get("/")).andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("Explore India")));
        mvc.perform(get("/css/style.css")).andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("--navy")));
        mvc.perform(get("/js/script.js")).andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("DOMContentLoaded")));
    }

    @Test void dashboardRequiresAuthentication() throws Exception {
        mvc.perform(get("/dashboard")).andExpect(status().is3xxRedirection());
    }

    @Test void signupCreatesHashedUserAndDuplicateIsRejected() throws Exception {
        mvc.perform(post("/signup").with(csrf()).param("name","Asha Rao").param("email","asha@example.com").param("mobile","9876543210").param("password","StrongPass1").param("confirmPassword","StrongPass1"))
                .andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("/login?registered"));
        org.junit.jupiter.api.Assertions.assertTrue(users.findByEmailIgnoreCase("asha@example.com").orElseThrow().getPasswordHash().startsWith("$2"));
        mvc.perform(post("/signup").with(csrf()).param("name","Asha Rao").param("email","asha@example.com").param("mobile","9876543210").param("password","StrongPass1").param("confirmPassword","StrongPass1"))
                .andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("already exists")));
    }

    @Test void loginAndLogoutUseSecurity() throws Exception {
        mvc.perform(post("/signup").with(csrf()).param("name","Asha Rao").param("email","login@example.com").param("mobile","9876543210").param("password","StrongPass1").param("confirmPassword","StrongPass1"));
        mvc.perform(post("/login").with(csrf()).param("username","login@example.com").param("password","StrongPass1"))
                .andExpect(status().is3xxRedirection()).andExpect(redirectedUrl("/dashboard"));
        mvc.perform(post("/logout").with(csrf())).andExpect(status().is3xxRedirection());
    }

    @Test void profileIsAvailableOnlyToSignedInUser() throws Exception {
        mvc.perform(get("/profile")).andExpect(status().is3xxRedirection());
        mvc.perform(post("/signup").with(csrf()).param("name","Profile User").param("email","profile@example.com").param("mobile","9876543210").param("password","StrongPass1").param("confirmPassword","StrongPass1"));
        mvc.perform(get("/profile").with(SecurityMockMvcRequestPostProcessors.user("profile@example.com")))
                .andExpect(status().isOk()).andExpect(content().string(org.hamcrest.Matchers.containsString("profile@example.com")));
    }
}
