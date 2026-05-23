package checkchow.back.auth;

import checkchow.back.auth.AuthService;
import checkchow.back.auth.RegistroService;
import checkchow.back.auth.dto.*;
import checkchow.back.config.jwt.JwtUtil;
import checkchow.back.config.jwt.service.TokenBlacklistService;
import checkchow.back.config.user.UsuarioDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioDetailsService usuarioDetailsService;
    private final RegistroService registroService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtUtil jwtUtil;
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthRegisterResponse>> register(@Valid @RequestBody AuthRegisterRequest request){
        try{
            AuthRegisterResponse response = registroService.registrarCliente(request);
            return ResponseEntity.ok(ApiResponse.success("Usuario registrado exitosamente", response));
        } catch (Exception e){
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al registrar usuario: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest loginRequest) {
        log.info("=== CONTROLLER LOGIN DEBUG ===");
        log.info("Recibido AuthRequest: {}", loginRequest);
        log.info("Correo: '{}'", loginRequest.getCorreo());
        log.info("Password: '{}'", loginRequest.getPassword());
        log.info("===============================");

        AuthResponse response = authService.login(loginRequest);

        if ("OK".equals(response.getStatus())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request){
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklistService.addToBlacklist(token);
        }
        return ResponseEntity.ok("La sesion a sido cerrada correctamente :D");
    }
}