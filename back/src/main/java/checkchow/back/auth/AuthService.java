package checkchow.back.auth;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import checkchow.back.auth.dto.AuthRequest;
import checkchow.back.auth.dto.AuthResponse;
import checkchow.back.enums.TAccion;
import checkchow.back.enums.TMetodoHttp;
import checkchow.back.seguridad.entity.Sesion;
import checkchow.back.seguridad.service.AuditoriaService;
import checkchow.back.user.Usuario;
import checkchow.back.user.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.security.Key;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Service
@Slf4j
public class AuthService{

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditoriaService auditoriaService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpiration;

    public AuthResponse login(AuthRequest loginRequest) {
        return login(loginRequest, null);
    }

    public AuthResponse login(AuthRequest loginRequest, HttpServletRequest httpRequest) {
        log.info("=== INICIO LOGIN DEBUG ===");
        log.info("AuthRequest recibido: {}", loginRequest);
        log.info("Correo: '{}' (length: {})", loginRequest.getEmail().toUpperCase(), loginRequest.getEmail() != null ? loginRequest.getEmail().length() : "null");
        log.info("Password: '{}' (length: {})", loginRequest.getPassword(), loginRequest.getPassword() != null ? loginRequest.getPassword().length() : "null");

        try {
            String email = loginRequest.getEmail().trim().toLowerCase();
            log.info("Buscando usuario por correo: '{}'", email);
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);

            if (usuarioOpt.isEmpty()) {
                log.warn("Usuario no encontrado para correo: '{}'", loginRequest.getEmail());
                auditoriaService.registrarEvento(null, null, TAccion.LOGIN, TMetodoHttp.POST,
                        "/api/auth/login", "usuario", null,
                        "{\"accion\":\"LOGIN_FALLIDO\",\"motivo\":\"USUARIO_NO_ENCONTRADO\"}", httpRequest);
                return new AuthResponse("ERROR", "Credenciales inválidas", null, null, null);
            }

            Usuario usuario = usuarioOpt.get();
            log.info("Usuario encontrado: ID={}, Correo={}, Nombre={}", usuario.getId(), usuario.getEmail(), usuario.getNombreCompleto());
            log.info("Password hash en BD: '{}'", usuario.getPassword());

            boolean passwordMatch = passwordEncoder.matches(loginRequest.getPassword(), usuario.getPassword());
            log.info("Verificación de contraseña: {}", passwordMatch);

            if (!passwordMatch) {
                log.warn("Contraseña incorrecta para usuario: '{}'", loginRequest.getEmail());
                auditoriaService.registrarEvento(usuario, null, TAccion.LOGIN, TMetodoHttp.POST,
                        "/api/auth/login", "usuario", String.valueOf(usuario.getId()),
                        "{\"accion\":\"LOGIN_FALLIDO\",\"motivo\":\"PASSWORD_INVALIDO\"}", httpRequest);
                return new AuthResponse("ERROR", "Credenciales inválidas", null, null, null);
            }

            String token = generateToken(usuario);
            Sesion sesion = auditoriaService.registrarSesion(usuario, token, httpRequest);
            auditoriaService.registrarEvento(usuario, sesion, TAccion.LOGIN, TMetodoHttp.POST,
                    "/api/auth/login", "usuario", String.valueOf(usuario.getId()),
                    "{\"accion\":\"LOGIN_EXITOSO\"}", httpRequest);
            log.info("Login exitoso para usuario: '{}'", loginRequest.getEmail());

            return new AuthResponse("OK", "Login exitoso", token, usuario.getId(), usuario.getNombreCompleto());

        } catch (Exception e) {
            log.error("Error durante el login: ", e);
            return new AuthResponse("ERROR", "Error interno del servidor: " + e.getMessage(), null, null, null);
        } finally {
            log.info("=== FIN LOGIN DEBUG ===");
        }
    }

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    private String generateToken(Usuario usuario) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", List.of("ROLE_" + usuario.getRol().name()));

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(usuario.getEmail())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }
}
