package checkchow.back.seguridad.service;

import checkchow.back.user.Usuario;
import checkchow.back.user.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioAutenticadoService {

    private final UsuarioRepository usuarioRepository;

    public Usuario obtenerActual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new RuntimeException("No hay usuario autenticado");
        }

        return usuarioRepository.findByEmail(authentication.getName().toLowerCase())
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
    }

    public Usuario obtenerUsuarioSistemaParaDatosExistentes() {
        return usuarioRepository.findFirstByActivoTrueOrderByIdAsc()
                .orElseThrow(() -> new RuntimeException("No existe un usuario activo para completar auditoria"));
    }

    public Usuario obtenerActualOUsuarioSistema() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            return usuarioRepository.findByEmail(authentication.getName().toLowerCase())
                    .orElseGet(this::obtenerUsuarioSistemaParaDatosExistentes);
        }

        return obtenerUsuarioSistemaParaDatosExistentes();
    }
}
