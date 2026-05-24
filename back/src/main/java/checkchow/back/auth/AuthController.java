package checkchow.back.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import checkchow.back.auth.dto.ApiResponse;
import checkchow.back.auth.dto.AuthRegisterRequest;
import checkchow.back.auth.dto.AuthRegisterResponse;
import checkchow.back.auth.dto.AuthRequest;
import checkchow.back.auth.dto.AuthResponse;
import checkchow.back.config.jwt.service.TokenBlacklistService;
import checkchow.back.seguridad.service.AuditoriaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegistroService registroService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuthService authService;
    private final AuditoriaService auditoriaService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthRegisterResponse>> register(@Valid @RequestBody AuthRegisterRequest request,
            HttpServletRequest httpRequest) {
        try {
            AuthRegisterResponse response = registroService.registrarCliente(request, httpRequest);
            return ResponseEntity.ok(ApiResponse.success("Usuario registrado exitosamente", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al registrar usuario: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest loginRequest,
            HttpServletRequest httpRequest) {
        log.info("=== CONTROLLER LOGIN DEBUG ===");
        log.info("Recibido AuthRequest: {}", loginRequest);
        log.info("Correo: '{}'", loginRequest.getEmail());
        log.info("Password: '{}'", loginRequest.getPassword());
        log.info("===============================");

        AuthResponse response = authService.login(loginRequest, httpRequest);

        if ("OK".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklistService.addToBlacklist(token);
            auditoriaService.cerrarSesionPorToken(token, request);
        }
        return ResponseEntity.ok("La sesion a sido cerrada correctamente :D");
    }
}
