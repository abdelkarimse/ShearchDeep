package com.deepShearch.deepShearch.config;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.List;

public class CustomSecurityFilter implements Filter {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomSecurityFilter.class);
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        try {
            String authorizationHeader = httpRequest.getHeader("Authorization");
            
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
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
                System.out.println("Roles from token: " + roles);
                // Convert roles to Spring Security authorities
                List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                    .toList();
                
                // Create authentication token and set in security context
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(username, null, authorities);
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                logger.debug("Authentication successful for user: {}", username);
                
            } else {
                logger.debug("No Bearer token found in the request");
            }
            
        } catch (Exception e) {
            logger.error("Error processing JWT token: {}", e.getMessage(), e);
            SecurityContextHolder.clearContext();
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.getWriter().write("Invalid or expired token");
            return;
        }
        
        chain.doFilter(request, response);
    }
}