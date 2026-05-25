package checkchow.back.config.jwt;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import checkchow.back.config.jwt.service.TokenBlacklistService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Slf4j
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final TokenBlacklistService tokenBlacklistService;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public JwtRequestFilter(
            UserDetailsService userDetailsService,
            JwtUtil jwtUtil,
            TokenBlacklistService tokenBlacklistService) {
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.tokenBlacklistService = tokenBlacklistService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        return HttpMethod.OPTIONS.matches(method)
                || path.startsWith("/api/auth/")
                || path.startsWith("/api/omr/")
                || path.startsWith("/api/resultado-admision/")
                || (HttpMethod.GET.matches(method) && "/api/proceso-admision".equals(path));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;

        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            log.warn("Solicitud sin Authorization: {} {}", request.getMethod(), request.getRequestURI());
        }

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                if (tokenBlacklistService.isBlacklisted(jwt)) {
                    log.warn("Token en blacklist para {} {}", request.getMethod(), request.getRequestURI());
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
                username = jwtUtil.extractUsername(jwt);
            } catch (Exception e) {
                log.warn("Token invalido o expirado para {} {}: {}",
                        request.getMethod(),
                        request.getRequestURI(),
                        e.getMessage());
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            if (jwtUtil.validateToken(jwt, userDetails)) {
                List<String> roles = jwtUtil.extractRoles(jwt);
                List<String> effectiveRoles = roles != null ? roles : List.of();
                List<GrantedAuthority> authorities = effectiveRoles.stream()
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                log.warn("Token no valido para usuario {} en {} {}",
                        username,
                        request.getMethod(),
                        request.getRequestURI());
            }
        }

        filterChain.doFilter(request, response);
    }
}
