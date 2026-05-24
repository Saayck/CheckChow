package checkchow.back.user;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;

    public Usuario CreateUsuario(Usuario usuario) {
        usuario.setNombre_completo(formatearNombreCompleto(usuario.getNombre_completo()));

        usuario.setEmail(usuario.getEmail().toLowerCase());
        usuario.setFechaCreacion(LocalDateTime.now());
        usuario.setFechaModificacion(LocalDateTime.now());
        if (usuario.getRol() == null) {
            usuario.setRol(checkchow.back.enums.TRol.ADMIN);
        }
        if (usuario.getActivo() == null) {
            usuario.setActivo(true);
        }

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepo.save(usuario);

    }

    public Usuario obtenerUsuarioSesion() {

        Authentication auth = SecurityContextHolder
                .getContext()
                .getAuthentication();

        String email = auth.getName();

        return usuarioRepo
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException(
                        "Usuario no encontrado"));
    }

    public Usuario modificarUsuario(Usuario usuario) {
        Usuario usuarioExistente = usuarioRepo.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + usuario.getId()));

        usuarioExistente.setNombre_completo(formatearNombreCompleto(usuario.getNombre_completo()));

        usuarioExistente.setEmail(usuario.getEmail().toLowerCase());
        if (usuario.getRol() != null) {
            usuarioExistente.setRol(usuario.getRol());
        }
        if (usuario.getActivo() != null) {
            usuarioExistente.setActivo(usuario.getActivo());
        }
        usuarioExistente.setFechaModificacion(LocalDateTime.now());

        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            usuarioExistente.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        return usuarioRepo.save(usuarioExistente);
    }

    public Optional<Usuario> getUsuarioById(Long id) {
        return usuarioRepo.findById(id);
    }

    public Optional<Usuario> getCorreo(String correo) {
        return usuarioRepo.findByEmail(correo);
    }

    public List<Usuario> listarUsuarios() {
        return usuarioRepo.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    public void eliminarUsuario(Long id) {
        usuarioRepo.deleteById(id);
    }

    private String formatearNombreCompleto(String nombreCompleto) {
        if (nombreCompleto == null || nombreCompleto.isBlank()) {
            return nombreCompleto;
        }

        return Arrays.stream(nombreCompleto.trim().split("\\s+"))
                .map(this::capitalizarPalabra)
                .reduce((actual, siguiente) -> actual + " " + siguiente)
                .orElse("");
    }

    private String capitalizarPalabra(String palabra) {
        String minuscula = palabra.toLowerCase(Locale.ROOT);
        return minuscula.substring(0, 1).toUpperCase(Locale.ROOT) + minuscula.substring(1);
    }

}
