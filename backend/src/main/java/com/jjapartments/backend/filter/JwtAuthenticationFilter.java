package com.jjapartments.backend.filter;

import com.jjapartments.backend.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Allow OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Public endpoints (no JWT required)
        if (path.equals("/api/users/login") ||
                path.equals("/api/users/add") ||
                path.equals("/api/requests/submit") ||
                path.equals("/api/tickets/submit") ||
                path.equals("/actuator/health")) {

            filterChain.doFilter(request, response);
            return;
        }

        // Protect all other /api/** endpoints
        if (path.startsWith("/api/")) {
            String authHeader = request.getHeader("Authorization");

            // Missing or malformed Authorization header
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                unauthorized(response, "Missing or invalid Authorization header");
                return;
            }

            String token = authHeader.substring(7); // strip "Bearer "

            // Validate token
            if (!jwtUtil.validateToken(token)) {
                unauthorized(response, "Invalid or expired token");
                return;
            }

            // Only set authentication if not already set
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                Claims claims = jwtUtil.extractClaims(token);

                String username = claims.getSubject();
                Integer userId = claims.get("userId", Integer.class);

                // Build Authentication (no roles/authorities for now)
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        username, // principal
                        null, // credentials not needed here
                        Collections.emptyList() // no roles
                );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));

                // Marks the user as authenticated
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Expose as request attributes for convenience
                request.setAttribute("username", username);
                request.setAttribute("userId", userId);
            }
        }

        // Continue filter chain
        filterChain.doFilter(request, response);
    }

    private void unauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
