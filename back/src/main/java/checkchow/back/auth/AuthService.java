package checkchow.back.auth;

import checkchow.back.auth.dto.AuthRequest;
import checkchow.back.auth.dto.AuthResponse;
import checkchow.back.user.Usuario;
import checkchow.back.user.UsuarioRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Date;
import java.util.Optional;

@RequiredArgsConstructor
@Service
@Slf4j
public class AuthService{

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpiration;

    public AuthResponse login(AuthRequest loginRequest) {
        log.info("=== INICIO LOGIN DEBUG ===");
        log.info("AuthRequest recibido: {}", loginRequest);
        log.info("Correo: '{}' (length: {})", loginRequest.getEmail().toUpperCase(), loginRequest.getEmail() != null ? loginRequest.getEmail().length() : "null");
        log.info("Password: '{}' (length: {})", loginRequest.getPassword(), loginRequest.getPassword() != null ? loginRequest.getPassword().length() : "null");

        try {
            log.info("Buscando usuario por correo: '{}'", loginRequest.getEmail());
            Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(loginRequest.getEmail().toUpperCase());

            if (usuarioOpt.isEmpty()) {
                log.warn("Usuario no encontrado para correo: '{}'", loginRequest.getEmail());
                return new AuthResponse("ERROR", "Credenciales inválidas", null, null, null);
            }

            Usuario usuario = usuarioOpt.get();
            log.info("Usuario encontrado: ID={}, Correo={}, Nombre={}", usuario.getId(), usuario.getEmail(), usuario.getNombre_completo());
            log.info("Password hash en BD: '{}'", usuario.getPassword());

            boolean passwordMatch = passwordEncoder.matches(loginRequest.getPassword(), usuario.getPassword());
            log.info("Verificación de contraseña: {}", passwordMatch);

            if (!passwordMatch) {
                log.warn("Contraseña incorrecta para usuario: '{}'", loginRequest.getEmail());
                return new AuthResponse("ERROR", "Credenciales inválidas", null, null, null);
            }

            String token = generateToken(usuario);
            log.info("Login exitoso para usuario: '{}'", loginRequest.getEmail());

            return new AuthResponse("OK", "Login exitoso", token, usuario.getId().longValue(), usuario.getNombre_completo());

        } catch (Exception e) {
            log.error("Error durante el login: ", e);
            return new AuthResponse("ERROR", "Error interno del servidor: " + e.getMessage(), null, null, null);
        } finally {
            log.info("=== FIN LOGIN DEBUG ===");
        }
    }

    private String generateToken(Usuario usuario) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        // Crear una clave segura para HS512
        SecretKey secretKey = createSecureKey(jwtSecret);

        return Jwts.builder()
                .setSubject(usuario.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Crea una clave segura de 512 bits para HS512 basada en el secreto configurado
     */
    private SecretKey createSecureKey(String secret) {
        try {
            // Usar SHA-512 para generar una clave de 512 bits a partir del secreto
            MessageDigest digest = MessageDigest.getInstance("SHA-512");
            byte[] hash = digest.digest(secret.getBytes(StandardCharsets.UTF_8));

            // Crear la clave secreta con los primeros 64 bytes (512 bits)
            return Keys.hmacShaKeyFor(hash);
        } catch (Exception e) {
            log.error("Error al crear la clave segura: ", e);
            // Como fallback, generar una clave completamente nueva y segura
            return Keys.secretKeyFor(SignatureAlgorithm.HS512);
        }
    }
}
