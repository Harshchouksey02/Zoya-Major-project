package com.agroveda.api.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtInterceptor implements HandlerInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        
        // Public endpoints
        if (path.equals("/api/auth/login") || 
            path.equals("/api/auth/signup") || 
            (path.startsWith("/api/products") && "GET".equalsIgnoreCase(request.getMethod())) ||
            path.startsWith("/api/functions/") ||
            path.startsWith("/h2-console")) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Access Token Required\"}");
            return false;
        }

        String token = authHeader.substring(7);
        try {
            String userId = jwtUtil.getUserId(token);
            String email = jwtUtil.getEmail(token);
            String role = jwtUtil.getRole(token);

            request.setAttribute("userId", userId);
            request.setAttribute("userEmail", email);
            request.setAttribute("userRole", role);
            
            // Enforce admin check for products modification (POST/DELETE)
            if (path.startsWith("/api/products") && !"GET".equalsIgnoreCase(request.getMethod())) {
                if (!"admin".equalsIgnoreCase(role)) {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"message\": \"Unauthorized action\"}");
                    return false;
                }
            }

            return true;
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\": \"Invalid or Expired Token\"}");
            return false;
        }
    }
}
