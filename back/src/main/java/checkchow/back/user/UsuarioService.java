package checkchow.back.user;

import checkchow.back.user.UsuarioRepository;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder passwordEncoder;
    public Usuario CreateUsuario(Usuario usuario) {
        usuario.setNombre_completo(usuario.getNombre_completo().toUpperCase());

        usuario.setEmail(usuario.getEmail().toUpperCase());
        usuario.setFechaCreacion(OffsetDateTime.from(LocalDateTime.now()));

        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepo.save(usuario);

    }
    public Usuario modificarUsuario(Usuario usuario) {
        Usuario usuarioExistente = usuarioRepo.findById(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + usuario.getId()));

        usuarioExistente.setNombre_completo(usuario.getNombre_completo().toUpperCase());

        usuarioExistente.setEmail(usuario.getEmail().toUpperCase());
        usuarioExistente.setFechaModificacion(OffsetDateTime.from(LocalDateTime.now()));

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
        return usuarioRepo.findAll(Sort.by(Sort.Direction.DESC, "id_usuario"));
    }

    public void eliminarUsuario(Long id) {
        usuarioRepo.deleteById(id);
    }

}
