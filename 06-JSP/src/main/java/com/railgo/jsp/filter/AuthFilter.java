package com.railgo.jsp.filter;

import jakarta.servlet.*; import jakarta.servlet.http.*; import java.io.IOException;

public class AuthFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest r = (HttpServletRequest) req; if (r.getSession(false) == null || r.getSession(false).getAttribute("user") == null) {
            ((HttpServletResponse) res).sendRedirect(r.getContextPath() + "/login?next=" + java.net.URLEncoder.encode(r.getRequestURI(), java.nio.charset.StandardCharsets.UTF_8)); return;
        } chain.doFilter(req, res);
    }
}
