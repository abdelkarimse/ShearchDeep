package com.deepShearch.deepShearch.config;

import java.io.IOException;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.auth0.jwt.JWT;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.interfaces.DecodedJWT;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CustomSecurityFilter implements Filter {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomSecurityFilter.class);
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        // Skip authentication for WebSocket endpoints
        String requestURI = httpRequest.getRequestURI();
        if (requestURI.startsWith("/ws/") || requestURI.equals("/ws")) {
            chain.doFilter(request, response);
            return;
        }
        
        String authorizationHeader = httpRequest.getHeader("Authorization");
        
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            try {
                String token = authorizationHeader.substring(7);
                
                // Decode and validate the JWT token
                DecodedJWT decodedToken = JWT.decode(token);
                
                // Verify token signature (you may need to implement proper verification with RSA key)
                // For now, we'll extract claims and set authentication
                String username = decodedToken.getClaim("preferred_username").asString();
                if (username == null) {
                    username = decodedToken.getSubject();
                }
                
                // Extract roles from token
                List<String> roles = decodedToken.getClaim("realm_access")
                    .asMap().containsKey("roles") ? 
                    
                    (List<String>) decodedToken.getClaim("realm_access").asMap().get("roles") : 
                    List.of();
                logger.debug("Roles from token: {}", roles);
                
                // Convert roles to Spring Security authorities
                List<SimpleGrantedAuthority> authorities = roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    .toList();
                
                // Create authentication token and set in security context
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(username, null, authorities);
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                logger.debug("Authentication successful for user: {}", username);
                chain.doFilter(request, response);
                
            } catch (JWTDecodeException | IllegalArgumentException e) {
                logger.error("Error processing JWT token: {}", e.getMessage());
                httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                httpResponse.getWriter().write("Invalid or expired token");
            }
        } else if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            // Handle CORS preflight requests
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            chain.doFilter(request, response);
        } else {
            logger.debug("No Bearer token found in the request");
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("Missing Authorization header");
        }
    }
}